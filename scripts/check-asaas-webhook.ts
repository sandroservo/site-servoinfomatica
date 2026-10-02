import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { applyPaymentEvent, nextStatus } from "../src/lib/orders";

async function main() {
  assert.equal(nextStatus("PENDING", "PAYMENT_RECEIVED"), "PAID");
  assert.equal(nextStatus("PAID", "PAYMENT_CONFIRMED"), null);
  assert.equal(nextStatus("PENDING", "PAYMENT_OVERDUE"), "CANCELED");
  assert.equal(nextStatus("PAID", "PAYMENT_OVERDUE"), null);
  assert.equal(nextStatus("PAID", "PAYMENT_REFUNDED"), "REFUNDED");

  const product = await prisma.product.findFirstOrThrow({ where: { inventory: { physical: { gt: 1 } } }, include: { inventory: true } });
  const before = product.inventory!;
  const tag = Date.now();

  async function makeOrder(paymentId: string) {
    await prisma.inventory.update({ where: { productId: product.id }, data: { reserved: { increment: 1 } } });
    return prisma.order.create({
      data: {
        billingType: "PIX", totalCents: 100, customerName: "Teste", customerEmail: "t@t.com",
        customerCpfCnpj: "00000000000", customerPhone: "11999999999", asaasPaymentId: paymentId,
        items: { create: { productId: product.id, name: product.name, qty: 1, unitCents: 100 } },
      },
    });
  }
  const stock = () => prisma.inventory.findUniqueOrThrow({ where: { productId: product.id } });

  const paid = await makeOrder(`pay_paid_${tag}`);
  assert.equal(await applyPaymentEvent({ id: `evt_a_${tag}`, event: "PAYMENT_RECEIVED", payment: { id: `pay_paid_${tag}` } }), "PAID");
  assert.equal(await applyPaymentEvent({ id: `evt_a_${tag}`, event: "PAYMENT_RECEIVED", payment: { id: `pay_paid_${tag}` } }), "duplicate");
  assert.equal(await applyPaymentEvent({ id: `evt_b_${tag}`, event: "PAYMENT_CONFIRMED", payment: { id: `pay_paid_${tag}` } }), "noop");
  let now = await stock();
  assert.deepEqual([now.physical, now.reserved], [before.physical - 1, before.reserved]);

  const canceled = await makeOrder(`pay_cancel_${tag}`);
  assert.equal(await applyPaymentEvent({ id: `evt_c_${tag}`, event: "PAYMENT_OVERDUE", payment: { id: `pay_cancel_${tag}` } }), "CANCELED");
  now = await stock();
  assert.deepEqual([now.physical, now.reserved], [before.physical - 1, before.reserved]);

  // cleanup
  await prisma.paymentEvent.deleteMany({ where: { orderId: { in: [paid.id, canceled.id] } } });
  await prisma.order.deleteMany({ where: { id: { in: [paid.id, canceled.id] } } });
  await prisma.inventory.update({ where: { productId: product.id }, data: { physical: before.physical, reserved: before.reserved } });
  console.log("ok");
}

main().finally(() => prisma.$disconnect());
