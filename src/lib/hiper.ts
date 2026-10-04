// Integração com o ERP Hiper Gestão (API personalizada de loja virtual).
// Doc: https://ajuda.hiper.com.br/ajudahiper/s/article/integracao-api-personalizada
// Swagger: https://ms-ecommerce.hiper.com.br/swagger/index.html
// Chave de segurança e opções ficam em /admin/configuracoes (tabela Setting), nunca no .env.
import { slugify } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getSettings, saveSettings } from "@/lib/settings";

const BASE = "https://ms-ecommerce.hiper.com.br/api/v1";

type HiperImage = { imagem: string | null };
type HiperVariation = {
  variacaoAtiva?: boolean;
  codigo: number;
  codigoDeBarras: string | null;
  id: string;
  nomeVariacaoA: string | null;
  nomeVariacaoB: string | null;
  quantidadeEmEstoque: number;
  quantidadeEmEstoqueReservado: number;
};
export type HiperProduct = {
  id: string;
  codigo: number;
  codigoDeBarras: string | null;
  nome: string | null;
  descricao: string | null;
  preco: number;
  ativo: boolean;
  removido: boolean;
  categoria: string | null;
  categoriaDoProdutoId: string | null;
  marca: string | null;
  imagem: string | null;
  imagensAdicionais: HiperImage[] | null;
  grade: boolean;
  variacao: HiperVariation[] | null;
  quantidadeEmEstoque: number;
  quantidadeEmEstoqueReservado?: number;
  quantidadeMinimaEmEstoque: number;
};

// ---------- HTTP + token ----------

// Token JWT reaproveitado até perto de expirar; um 401 força gerar outro.
let cachedToken: { key: string; token: string; exp: number } | null = null;

function jwtExp(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 30 * 60 * 1000;
  } catch {
    return Date.now() + 30 * 60 * 1000;
  }
}

async function securityKey() {
  const key = (await getSettings()).hiperSecurityKey.trim();
  if (!key) throw new Error("Configure a chave de segurança do Hiper em Configurações.");
  return key;
}

async function token(force = false) {
  const key = await securityKey();
  if (!force && cachedToken && cachedToken.key === key && cachedToken.exp - 60_000 > Date.now()) {
    return cachedToken.token;
  }
  const response = await fetch(`${BASE}/auth/gerar-token/${encodeURIComponent(key)}`, { cache: "no-store" });
  const data = (await response.json().catch(() => null)) as { token?: string; message?: string; errors?: string[] } | null;
  if (!response.ok || !data?.token) {
    throw new Error(`Hiper recusou a chave de segurança (${response.status}). ${data?.message ?? data?.errors?.join(" ") ?? ""}`.trim());
  }
  cachedToken = { key, token: data.token, exp: jwtExp(data.token) };
  return data.token;
}

async function hiper<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${BASE}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${await token()}`,
        "Content-Type": "application/json",
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    if (response.status === 401 && attempt === 0) {
      cachedToken = null;
      continue;
    }
    if (response.status === 429 || response.status >= 502) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      continue;
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = [data?.message, ...(data?.errors ?? [])].filter(Boolean).join(" ");
      throw new Error(`Hiper ${response.status}: ${detail || response.statusText}`);
    }
    return data as T;
  }
  throw new Error("Hiper indisponível no momento (muitas tentativas).");
}

export async function testHiperConnection() {
  cachedToken = null;
  await token(true);
}

// ---------- Mapeamento produto Hiper -> loja ----------

export type MappedProduct = {
  hiperId: string;
  hiperCode: number;
  name: string;
  sku: string;
  ean: string | null;
  description: string;
  priceCents: number;
  active: boolean;
  stock: number;
  minimum: number;
  categoryName: string;
  categoryHiperId: string | null;
  brandName: string;
  images: string[];
};

const stockOf = (quantity: number, reserved = 0) => Math.max(0, Math.floor(quantity - reserved));

// Produto com grade vira um item por variação ativa: o pedido no Hiper precisa do id da variação.
export function mapHiperProduct(product: HiperProduct): MappedProduct[] {
  const name = (product.nome ?? "").trim() || `Produto ${product.codigo}`;
  const images = [product.imagem, ...(product.imagensAdicionais ?? []).map((image) => image.imagem)]
    .filter((url): url is string => Boolean(url && /^https?:\/\//.test(url)));
  const base = {
    hiperCode: product.codigo,
    description: (product.descricao ?? "").trim(),
    priceCents: Math.round((product.preco ?? 0) * 100),
    categoryName: (product.categoria ?? "").trim() || "Outros",
    categoryHiperId: product.categoriaDoProdutoId,
    brandName: (product.marca ?? "").trim() || "Sem marca",
    minimum: Math.max(0, Math.floor(product.quantidadeMinimaEmEstoque ?? 0)),
    images,
  };
  const visible = product.ativo && !product.removido && base.priceCents > 0;

  const variations = product.grade ? (product.variacao ?? []) : [];
  if (variations.length) {
    return variations.map((variation) => {
      const label = [variation.nomeVariacaoA, variation.nomeVariacaoB].filter(Boolean).join(" / ");
      return {
        ...base,
        hiperId: variation.id,
        name: label ? `${name} - ${label}` : name,
        sku: `${product.codigo}-${variation.codigoDeBarras || variation.id.slice(0, 8)}`,
        ean: variation.codigoDeBarras || null,
        active: visible && variation.variacaoAtiva !== false,
        stock: stockOf(variation.quantidadeEmEstoque, variation.quantidadeEmEstoqueReservado),
      };
    });
  }

  return [
    {
      ...base,
      hiperId: product.id,
      name,
      sku: String(product.codigo),
      ean: product.codigoDeBarras || null,
      active: visible,
      stock: stockOf(product.quantidadeEmEstoque, product.quantidadeEmEstoqueReservado),
    },
  ];
}

// ---------- Gravação no banco da loja ----------

async function uniqueSlug(base: string, model: "product" | "category" | "brand") {
  const root = base || "item";
  for (let index = 1; ; index += 1) {
    const slug = index === 1 ? root : `${root}-${index}`;
    const taken =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug }, select: { id: true } })
        : model === "category"
          ? await prisma.category.findUnique({ where: { slug }, select: { id: true } })
          : await prisma.brand.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
  }
}

async function categoryId(item: MappedProduct) {
  if (item.categoryHiperId) {
    const linked = await prisma.category.findUnique({ where: { hiperId: item.categoryHiperId } });
    if (linked) return linked.id;
  }
  const slug = slugify(item.categoryName);
  const bySlug = await prisma.category.findUnique({ where: { slug } });
  if (bySlug) {
    if (item.categoryHiperId && !bySlug.hiperId) {
      await prisma.category.update({ where: { id: bySlug.id }, data: { hiperId: item.categoryHiperId } });
    }
    return bySlug.id;
  }
  const created = await prisma.category.create({
    data: {
      name: item.categoryName,
      slug: await uniqueSlug(slug, "category"),
      description: "",
      sortOrder: 100,
      hiperId: item.categoryHiperId,
    },
  });
  return created.id;
}

async function brandId(name: string) {
  const slug = slugify(name);
  const found = await prisma.brand.findUnique({ where: { slug } });
  if (found) return found.id;
  return (await prisma.brand.create({ data: { name, slug: await uniqueSlug(slug, "brand") } })).id;
}

// Hiper é dono de: nome, preço, estoque, situação, código e fotos (quando tiver).
// A loja é dona de: categoria/marca depois de criado, promoção, destaque, Pix, garantia e ficha técnica.
async function upsertProduct(item: MappedProduct) {
  const now = new Date();
  const existing = await prisma.product.findUnique({
    where: { hiperId: item.hiperId },
    select: { id: true, promoPriceCents: true, description: true, _count: { select: { images: true } } },
  });
  const images = item.images.map((url, sortOrder) => ({ url, alt: item.name, sortOrder }));

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: item.name,
        hiperCode: item.hiperCode,
        ean: item.ean,
        priceCents: item.priceCents,
        // promoção que ficou maior que o novo preço do ERP deixa de valer
        ...(existing.promoPriceCents != null && existing.promoPriceCents >= item.priceCents ? { promoPriceCents: null } : {}),
        ...(item.description ? { description: item.description } : {}),
        active: item.active,
        hiperSyncedAt: now,
        ...(images.length ? { images: { deleteMany: {}, create: images } } : {}),
        inventory: {
          upsert: {
            create: { physical: item.stock, minimum: item.minimum },
            update: { physical: item.stock, minimum: item.minimum },
          },
        },
      },
    });
    return "updated" as const;
  }

  await prisma.product.create({
    data: {
      hiperId: item.hiperId,
      hiperCode: item.hiperCode,
      hiperSyncedAt: now,
      name: item.name,
      slug: await uniqueSlug(slugify(`${item.name}-${item.hiperCode}`), "product"),
      sku: await uniqueSku(item.sku),
      ean: item.ean,
      brandId: await brandId(item.brandName),
      categoryId: await categoryId(item),
      summary: item.description.slice(0, 160),
      description: item.description,
      priceCents: item.priceCents,
      pixDiscountPercent: 5,
      warrantyMonths: 3,
      rating: 0,
      reviewCount: 0,
      active: item.active,
      purpose: "",
      images: { create: images },
      inventory: { create: { physical: item.stock, minimum: item.minimum } },
    },
  });
  return "created" as const;
}

async function uniqueSku(base: string) {
  for (let index = 1; ; index += 1) {
    const sku = index === 1 ? base : `${base}-${index}`;
    if (!(await prisma.product.findUnique({ where: { sku }, select: { id: true } }))) return sku;
  }
}

// ---------- Sincronização ----------

const MAX_PAGES = 500;

async function syncProducts(fromPoint: number) {
  const counts = { created: 0, updated: 0, failed: 0 };
  let point = fromPoint;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const data = await hiper<{ pontoDeSincronizacao: number; produtos: HiperProduct[] | null }>(
      `/produtos/listagemDeProdutos?pontoDeSincronizacao=${fromPoint}&pagina=${page}`,
    );
    point = Math.max(point, data.pontoDeSincronizacao ?? 0);
    const products = data.produtos ?? [];
    if (!products.length) break;
    for (const product of products) {
      for (const item of mapHiperProduct(product)) {
        try {
          counts[await upsertProduct(item)] += 1;
        } catch (error) {
          counts.failed += 1;
          console.error("hiper: produto", item.hiperId, error);
        }
      }
    }
  }
  return { ...counts, point };
}

async function syncStock(fromPoint: number) {
  let updated = 0;
  let point = fromPoint;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const data = await hiper<{
      estoquesDeProdutos:
        | { produtoId: string; pontoDeSincronizacao: number; quantidadeEmEstoque: number; quantidadeEmEstoqueReservado: number; quantidadeMinimaEmEstoque: number }[]
        | null;
    }>(`/estoques/estoquesDeProdutos?pontoDeSincronizacao=${fromPoint}&pagina=${page}`);
    const rows = data.estoquesDeProdutos ?? [];
    if (!rows.length) break;
    for (const row of rows) {
      point = Math.max(point, row.pontoDeSincronizacao ?? 0);
      const result = await prisma.inventory.updateMany({
        where: { product: { hiperId: row.produtoId } },
        data: { physical: stockOf(row.quantidadeEmEstoque, row.quantidadeEmEstoqueReservado) },
      });
      updated += result.count;
    }
  }
  return { updated, point };
}

let running: Promise<string> | null = null;

// full = começa do ponto 0 (reimporta tudo). Só uma sincronização por vez no processo.
export function syncHiper({ full = false } = {}) {
  running ??= (async () => {
    const settings = await getSettings();
    const started = new Date();
    try {
      const products = await syncProducts(full ? 0 : Number(settings.hiperProductPoint) || 0);
      const stock = await syncStock(full ? 0 : Number(settings.hiperStockPoint) || 0);
      const result = `${started.toLocaleString("pt-BR")}: ${products.created} novos, ${products.updated} atualizados, ${stock.updated} estoques${products.failed ? `, ${products.failed} com erro` : ""}.`;
      await saveSettings({
        hiperProductPoint: String(products.point),
        hiperStockPoint: String(stock.point),
        hiperLastSyncAt: started.toISOString(),
        hiperLastResult: result,
      });
      return result;
    } catch (error) {
      const result = `${started.toLocaleString("pt-BR")}: erro — ${error instanceof Error ? error.message : String(error)}`;
      await saveSettings({ hiperLastSyncAt: started.toISOString(), hiperLastResult: result });
      throw error;
    }
  })().finally(() => {
    running = null;
  });
  return running;
}

// ---------- Pedidos ----------

const PAYMENT_ID = { PIX: 12, CREDIT_CARD: 4 } as const;

// Envia pedido pago ao Hiper (vira pedido de venda lá). Idempotente: não reenvia se já tem id.
export async function sendOrderToHiper(orderId: string) {
  const settings = await getSettings();
  if (!settings.hiperSecurityKey || settings.hiperSendOrders !== "1") return "disabled";

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: { select: { hiperId: true, name: true } } } } },
  });
  if (order.hiperOrderId) return "already-sent";
  if (order.status !== "PAID") return "not-paid";

  try {
    const missing = order.items.filter((item) => !item.product.hiperId);
    if (missing.length) {
      throw new Error(`Itens sem vínculo com o Hiper: ${missing.map((item) => item.name).join(", ")}.`);
    }
    const total = order.totalCents / 100;
    const result = await hiper<{ id: string }>("/pedido-de-venda", {
      method: "POST",
      body: {
        cliente: {
          documento: order.customerCpfCnpj,
          email: order.customerEmail,
          inscricaoEstadual: "",
          nomeDoCliente: order.customerName,
          nomeFantasia: "",
        },
        itens: order.items.map((item) => ({
          produtoId: item.product.hiperId,
          quantidade: item.qty,
          precoUnitarioBruto: item.unitCents / 100,
          precoUnitarioLiquido: item.unitCents / 100,
        })),
        meiosDePagamento: [{ idMeioDePagamento: PAYMENT_ID[order.billingType], parcelas: 1, valor: total }],
        numeroPedidoDeVenda: String(order.number),
        observacao: `Pedido #${order.number} do site. Retirada na loja. Asaas ${order.asaasPaymentId ?? ""}. Tel ${order.customerPhone}.`,
        valorDoFrete: 0,
      },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { hiperOrderId: result.id, hiperSentAt: new Date(), hiperError: null },
    });
    return "sent";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.order.update({ where: { id: order.id }, data: { hiperError: message.slice(0, 500) } });
    console.error("hiper: pedido", order.number, message);
    return "failed";
  }
}

export async function cancelOrderInHiper(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.hiperOrderId) return "not-sent";
  try {
    await hiper(`/pedido-de-venda/cancelar/${order.hiperOrderId}`, { method: "PUT" });
    return "canceled";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.order.update({ where: { id: order.id }, data: { hiperError: `Cancelamento: ${message}`.slice(0, 500) } });
    return "failed";
  }
}

export type HiperOrderStatus = { codigoDoPedidoDeVenda: string | null; cancelado: boolean; codigoDaSituacaoDeProcessamento: number };

export function getHiperOrder(hiperOrderId: string) {
  return hiper<HiperOrderStatus>(`/pedido-de-venda/eventos/${hiperOrderId}`);
}
