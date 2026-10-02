import { Prisma, type BillingType, type OrderStatus } from "@prisma/client";
import { z } from "zod";
import { createPayment, findOrCreateCustomer } from "@/lib/asaas";
import { effectivePriceCents, pixPriceCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const digits = (value: string) => value.replace(/\D/g, "");

export const checkoutSchema = z.object({
  billingType: z.enum(["PIX", "CREDIT_CARD"]),
  items: z
    .array(z.object({ slug: z.string().min(1), qty: z.number().int().min(1).max(20) }))
    .min(1, "Carrinho vazio."),
  customer: z.object({
    name: z.string().trim().min(3, "Informe o nome completo."),
    email: z.email("E-mail inválido."),
    cpfCnpj: z.string().transform(digits).refine((v) => v.length === 11 || v.length === 14, "CPF/CNPJ inválido."),
    phone: z.string().transform(digits).refine((v) => v.length === 10 || v.length === 11, "Telefone inválido."),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

type Tx = Prisma.TransactionClient;
type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

// Reserva atômica: só incrementa se ainda houver disponível (físico − reservado).
async function reserve(tx: Tx, productId: string, qty: number) {
  const updated = await tx.$executeRaw`
    UPDATE "Inventory" SET "reserved" = "reserved" + ${qty}
    WHERE "productId" = ${productId} AND "physical" - "reserved" >= ${qty}`;
  return updated === 1;
}

async function releaseReserved(tx: Tx, order: OrderWithItems) {
  for (const item of order.items) {
    await tx.$executeRaw`
      UPDATE "Inventory" SET "reserved" = GREATEST("reserved" - ${item.qty}, 0)
      WHERE "productId" = ${item.productId}`;
  }
}

async function consumeStock(tx: Tx, order: OrderWithItems, wasReserved: boolean) {
  for (const item of order.items) {
    await tx.$executeRaw`
      UPDATE "Inventory" SET
        "physical" = "physical" - ${item.qty},
        "reserved" = GREATEST("reserved" - ${wasReserved ? item.qty : 0}, 0)
      WHERE "productId" = ${item.productId}`;
  }
}

export async function createOrder(input: CheckoutInput) {
  const products = await prisma.product.findMany({
    where: { slug: { in: input.items.map((item) => item.slug) }, active: true },
  });

  const lines = input.items.map((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    if (!product) throw new Error("Produto indisponível no carrinho.");
    const price = effectivePriceCents(product.priceCents, product.promoPriceCents);
    const unitCents = input.billingType === "PIX" ? pixPriceCents(price, product.pixDiscountPercent) : price;
    return { productId: product.id, name: product.name, qty: item.qty, unitCents };
  });
  const totalCents = lines.reduce((sum, line) => sum + line.unitCents * line.qty, 0);

  const order = await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      if (!(await reserve(tx, line.productId, line.qty))) {
        throw new Error(`Sem estoque suficiente para ${line.name}.`);
      }
    }
    return tx.order.create({
      data: {
        billingType: input.billingType,
        totalCents,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerCpfCnpj: input.customer.cpfCnpj,
        customerPhone: input.customer.phone,
        items: { create: lines },
      },
      include: { items: true },
    });
  });

  try {
    const customerId = await findOrCreateCustomer(input.customer);
    const payment = await createPayment({
      customer: customerId,
      billingType: input.billingType,
      valueCents: totalCents,
      description: `Pedido #${order.number} - Servo Informática`,
      externalReference: order.id,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { asaasCustomerId: customerId, asaasPaymentId: payment.id, invoiceUrl: payment.invoiceUrl },
    });
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await releaseReserved(tx, order);
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELED" } });
    });
    throw error;
  }

  return order.id;
}

const PAID_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
const CANCEL_EVENTS = ["PAYMENT_OVERDUE", "PAYMENT_DELETED", "PAYMENT_REPROVED_BY_RISK_ANALYSIS"];

// Decide o próximo status; null = evento não muda o pedido.
export function nextStatus(current: OrderStatus, event: string): OrderStatus | null {
  if (PAID_EVENTS.includes(event) && (current === "PENDING" || current === "CANCELED")) return "PAID";
  if (CANCEL_EVENTS.includes(event) && current === "PENDING") return "CANCELED";
  if (event === "PAYMENT_REFUNDED" && current === "PAID") return "REFUNDED";
  return null;
}

export type AsaasWebhook = { id: string; event: string; payment?: { id: string } };

// Idempotente: o id do evento é chave primária de PaymentEvent. Tudo numa transação,
// então se falhar nada é gravado e o Asaas reenvia.
export async function applyPaymentEvent(body: AsaasWebhook) {
  const paymentId = body.payment?.id;
  if (!body.id || !paymentId) return "ignored";

  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { asaasPaymentId: paymentId }, include: { items: true } });
      await tx.paymentEvent.create({
        data: {
          id: body.id,
          event: body.event,
          paymentId,
          orderId: order?.id,
          payload: body as unknown as Prisma.InputJsonValue,
        },
      });
      if (!order) return "no-order";

      const status = nextStatus(order.status, body.event);
      if (!status) return "noop";

      if (status === "PAID") await consumeStock(tx, order, order.status === "PENDING");
      if (status === "CANCELED") await releaseReserved(tx, order);
      // ponytail: estorno não devolve ao estoque sozinho (produto volta para conferência); ajuste manual em /admin/estoque.
      await tx.order.update({ where: { id: order.id }, data: { status } });
      return status;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "duplicate";
    throw error;
  }
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  CANCELED: "Cancelado",
  REFUNDED: "Estornado",
};

export const billingTypeLabel: Record<BillingType, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
};
