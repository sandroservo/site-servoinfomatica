// Testa a integração Hiper sem acessar a API real: o fetch é simulado com os exemplos da documentação.
// Uso: npx tsx scripts/check-hiper.ts
import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { mapHiperProduct, sendOrderToHiper, syncHiper, type HiperProduct } from "../src/lib/hiper";
import { getSettings, saveSettings } from "../src/lib/settings";

const grade: HiperProduct = {
  id: "c519473f-e3f9-4260-b930-c213685c4856",
  codigo: 990001,
  codigoDeBarras: "3024",
  nome: "Mouse Teste Hiper",
  descricao: "Mouse sem fio",
  preco: 188.43,
  ativo: true,
  removido: false,
  categoria: "Periféricos Teste",
  categoriaDoProdutoId: "e5ce5e44-7db1-4643-a40a-c2a600556fad",
  marca: "MARCA TESTE HIPER",
  imagem: "https://tst-hipergestao.s3.amazonaws.com/x/original.jpeg",
  imagensAdicionais: [{ imagem: "https://tst-hipergestao.s3.amazonaws.com/y/original.jpeg" }],
  grade: true,
  quantidadeEmEstoque: 0,
  quantidadeMinimaEmEstoque: 0,
  variacao: [
    { variacaoAtiva: true, codigo: 990001, codigoDeBarras: "9990000000173", id: "e23efd5c-e9b9-4e97-bd8b-4e5c688e4b17", nomeVariacaoA: "Azul", nomeVariacaoB: null, quantidadeEmEstoque: 18, quantidadeEmEstoqueReservado: 2 },
    { variacaoAtiva: true, codigo: 990001, codigoDeBarras: "9990000000180", id: "5005141d-e990-418f-baa5-76d586a28d36", nomeVariacaoA: "Amarelo", nomeVariacaoB: null, quantidadeEmEstoque: 4, quantidadeEmEstoqueReservado: 0 },
    { variacaoAtiva: false, codigo: 990001, codigoDeBarras: "9990000000333", id: "9ef54b5d-769e-4c60-bed8-64270543c39c", nomeVariacaoA: "Vermelho", nomeVariacaoB: null, quantidadeEmEstoque: 17, quantidadeEmEstoqueReservado: 0 },
  ],
};
const simple: HiperProduct = {
  ...grade,
  id: "e41acf38-3f4b-4309-8988-8b33a4e5f359",
  codigo: 990002,
  codigoDeBarras: "7891234567890",
  nome: "Teclado Teste Hiper",
  preco: 99.9,
  grade: false,
  variacao: [],
  quantidadeEmEstoque: 7.6,
  quantidadeEmEstoqueReservado: 1,
};
const hiperIds = [simple.id, ...grade.variacao!.map((variation) => variation.id)];

let sentOrder: Record<string, unknown> | null = null;
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input);
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
  if (url.includes("/auth/gerar-token/")) return json({ token: "a.eyJleHAiOjk5OTk5OTk5OTl9.b", errors: [] });
  if (url.includes("/produtos/listagemDeProdutos")) {
    return json({ pontoDeSincronizacao: 42, produtos: url.includes("pagina=1") ? [grade, simple] : [] });
  }
  if (url.includes("/estoques/estoquesDeProdutos")) {
    return json({
      estoquesDeProdutos: url.includes("pagina=1")
        ? [{ produtoId: simple.id, pontoDeSincronizacao: 50, quantidadeEmEstoque: 3, quantidadeEmEstoqueReservado: 0, quantidadeMinimaEmEstoque: 0 }]
        : [],
    });
  }
  if (url.endsWith("/pedido-de-venda") && init?.method === "POST") {
    sentOrder = JSON.parse(String(init.body));
    return json({ id: "793bd707-505f-44bb-b02b-56972bf365d5", errors: [], message: "Pedido recebido e em processamento." });
  }
  return realFetch(input, init);
}) as typeof fetch;

async function cleanup() {
  const products = await prisma.product.findMany({ where: { hiperId: { in: hiperIds } }, select: { id: true } });
  const ids = products.map((product) => product.id);
  const orders = await prisma.orderItem.findMany({ where: { productId: { in: ids } }, select: { orderId: true } });
  await prisma.order.deleteMany({ where: { id: { in: orders.map((order) => order.orderId) } } });
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  await prisma.category.deleteMany({ where: { hiperId: grade.categoriaDoProdutoId } });
  await prisma.brand.deleteMany({ where: { slug: "marca-teste-hiper" } });
}

async function main() {
  // 1. Mapeamento puro
  const mapped = mapHiperProduct(grade);
  assert.equal(mapped.length, 3);
  assert.equal(mapped[0].name, "Mouse Teste Hiper - Azul");
  assert.equal(mapped[0].stock, 16);
  assert.equal(mapped[0].priceCents, 18843);
  assert.equal(mapped[2].active, false);
  assert.equal(mapHiperProduct({ ...simple, removido: true })[0].active, false);
  assert.equal(mapHiperProduct(simple)[0].stock, 6);

  const original = await getSettings();
  await cleanup();
  try {
    await saveSettings({ hiperSecurityKey: "x".repeat(64), hiperSendOrders: "1" });

    // 2. Sincronização completa cria categoria, marca, produtos, fotos e estoque
    const first = await syncHiper({ full: true });
    assert.match(first, /4 novos, 0 atualizados, 1 estoques/);
    const teclado = await prisma.product.findUniqueOrThrow({ where: { hiperId: simple.id }, include: { inventory: true, images: true, category: true, brand: true } });
    assert.equal(teclado.priceCents, 9990);
    assert.equal(teclado.inventory?.physical, 3);
    assert.equal(teclado.images.length, 2);
    assert.equal(teclado.category.name, "Periféricos Teste");
    assert.equal(teclado.brand.name, "MARCA TESTE HIPER");
    assert.equal((await getSettings()).hiperProductPoint, "42");

    // 3. Segunda sincronização atualiza, não duplica; categoria trocada pelo admin é mantida
    const outra = await prisma.category.findFirstOrThrow({ where: { hiperId: null } });
    await prisma.product.update({ where: { id: teclado.id }, data: { categoryId: outra.id } });
    const second = await syncHiper();
    assert.match(second, /0 novos, 4 atualizados/);
    assert.equal(await prisma.product.count({ where: { hiperId: { in: hiperIds } } }), 4);
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: teclado.id } })).categoryId, outra.id);

    // 4. Pedido pago vira pedido de venda no Hiper com o id da variação
    const azul = await prisma.product.findUniqueOrThrow({ where: { hiperId: mapped[0].hiperId } });
    const order = await prisma.order.create({
      data: {
        status: "PAID", billingType: "PIX", totalCents: 35800, customerName: "Cliente Teste", customerEmail: "c@t.com",
        customerCpfCnpj: "19561920000", customerPhone: "99991823014", asaasPaymentId: `pay_hiper_${Date.now()}`,
        items: { create: { productId: azul.id, name: azul.name, qty: 2, unitCents: 17900 } },
      },
    });
    assert.equal(await sendOrderToHiper(order.id), "sent");
    const body = sentOrder as unknown as { itens: { produtoId: string; quantidade: number; precoUnitarioLiquido: number }[]; meiosDePagamento: { idMeioDePagamento: number; valor: number }[]; cliente: { documento: string } };
    assert.equal(body.itens[0].produtoId, mapped[0].hiperId);
    assert.equal(body.itens[0].quantidade, 2);
    assert.equal(body.itens[0].precoUnitarioLiquido, 179);
    assert.deepEqual(body.meiosDePagamento[0], { idMeioDePagamento: 12, parcelas: 1, valor: 358 });
    assert.equal(body.cliente.documento, "19561920000");
    assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).hiperOrderId, "793bd707-505f-44bb-b02b-56972bf365d5");
    assert.equal(await sendOrderToHiper(order.id), "already-sent");

    console.log("ok");
  } finally {
    await cleanup();
    await saveSettings({
      hiperSecurityKey: original.hiperSecurityKey,
      hiperSendOrders: original.hiperSendOrders,
      hiperProductPoint: original.hiperProductPoint,
      hiperStockPoint: original.hiperStockPoint,
      hiperLastSyncAt: original.hiperLastSyncAt,
      hiperLastResult: original.hiperLastResult,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
