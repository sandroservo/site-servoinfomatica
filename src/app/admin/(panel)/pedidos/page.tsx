import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { formatBRL } from "@/lib/money";
import { billingTypeLabel, orderStatusLabel } from "@/lib/orders";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pedidos" };

export default async function OrdersAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const orders = paginate(
    await prisma.order.findMany({
      include: { items: true, _count: { select: { events: true } } },
      orderBy: { createdAt: "desc" },
    }),
    parsePage(page),
  );

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Vendas</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Pedidos</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-500">
        Status atualizado automaticamente pelo webhook do Asaas.
      </p>
      <div className="mt-6 space-y-3">
        {orders.items.length === 0 ? <p className="text-sm text-neutral-500">Nenhum pedido ainda.</p> : null}
        {orders.items.map((order) => (
          <div key={order.id} className="grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-[auto_1.5fr_1fr_1fr_auto] md:items-center">
            <Link href={`/pedido/${order.id}`} target="_blank" className="font-medium hover:text-primary">
              #{order.number}
            </Link>
            <div>
              <p className="text-sm font-medium">{order.customerName}</p>
              <p className="text-xs text-neutral-500">
                {order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}
              </p>
            </div>
            <p className="text-sm">
              {formatBRL(order.totalCents)} · {billingTypeLabel[order.billingType]}
            </p>
            <p className="text-sm">
              {orderStatusLabel[order.status]}
              <span className="block text-xs text-neutral-500">{order._count.events} evento(s) Asaas</span>
            </p>
            <p className="text-xs text-neutral-500">{order.createdAt.toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>
      <Pagination page={orders.page} pages={orders.pages} href={(next) => pageHref("/admin/pedidos", {}, next)} />
    </div>
  );
}
