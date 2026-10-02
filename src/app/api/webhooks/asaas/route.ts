import { timingSafeEqual } from "node:crypto";
import { applyPaymentEvent, type AsaasWebhook } from "@/lib/orders";
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
  return Response.json({ received: true, result });
}
