import { checkoutSchema, createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  try {
    const orderId = await createOrder(parsed.data);
    return Response.json({ orderId });
  } catch (error) {
    console.error("checkout", error);
    const message = error instanceof Error ? error.message : "Não foi possível criar o pedido.";
    return Response.json({ error: message }, { status: 422 });
  }
}
