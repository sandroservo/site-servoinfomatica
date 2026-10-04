import { timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { cancelOrderInHiper, sendOrderToHiper } from "@/lib/hiper";
import { applyPaymentEvent, type AsaasWebhook } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { asaasWebhookToken } from "@/lib/settings";

async function validToken(received: string | null) {
  const expected = await asaasWebhookToken();
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!(await validToken(request.headers.get("asaas-access-token")))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as AsaasWebhook | null;
  if (!body) return Response.json({ error: "invalid body" }, { status: 400 });

  // Erro aqui → 500 → Asaas reenvia; o id do evento impede processar duas vezes.
  const result = await applyPaymentEvent(body);

  // Pago vira pedido de venda no ERP Hiper; estorno cancela lá. Roda depois de responder ao Asaas.
  if ((result === "PAID" || result === "REFUNDED") && body.payment?.id) {
    const order = await prisma.order.findUnique({ where: { asaasPaymentId: body.payment.id }, select: { id: true } });
    if (order) after(() => (result === "PAID" ? sendOrderToHiper(order.id) : cancelOrderInHiper(order.id)));
  }
  return Response.json({ received: true, result });
}
