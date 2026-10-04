import type { Metadata } from "next";
import Link from "next/link";
import { resendHiperOrderAction } from "@/app/admin/actions";
import { Pagination } from "@/components/pagination";
import { formatBRL } from "@/lib/money";
import { billingTypeLabel, orderStatusLabel } from "@/lib/orders";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pedidos" };

const hiperNotices: Record<string, string> = {
  sent: "Pedido enviado ao Hiper.",
  failed: "O Hiper recusou o pedido. Veja o motivo na linha do pedido.",
  disabled: "Envio ao Hiper desligado ou sem chave em Configurações.",
  "already-sent": "Esse pedido já estava no Hiper.",
  "not-paid": "Só pedidos pagos vão para o Hiper.",
};

export default async function OrdersAdminPage({ searchParams }: { searchParams: Promise<{ page?: string; hiper?: string }> }) {
  const { page, hiper } = await searchParams;
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
        Status atualizado automaticamente pelo webhook do Asaas. Pedidos pagos seguem para o ERP Hiper.
      </p>
      {hiper && hiperNotices[hiper] ? <p className="mt-4 text-sm text-emerald-700">{hiperNotices[hiper]}</p> : null}
      <div className="mt-6 space-y-3">
        {orders.items.length === 0 ? <p className="text-sm text-neutral-500">Nenhum pedido ainda.</p> : null}
        {orders.items.map((order) => (
          <div key={order.id} className="grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-[auto_1.5fr_1fr_1fr_1.2fr_auto] md:items-center">
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
            <div className="text-xs">
              {order.hiperOrderId ? (
                <p className="text-emerald-700">No Hiper ✓</p>
              ) : order.status === "PAID" ? (
                <>
                  <p className="text-primary">{order.hiperError ? `Hiper: ${order.hiperError}` : "Ainda não enviado ao Hiper"}</p>
                  <form action={resendHiperOrderAction} className="mt-1">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" className="font-semibold underline">Reenviar ao Hiper</button>
                  </form>
                </>
              ) : (
                <p className="text-neutral-400">—</p>
              )}
            </div>
            <p className="text-xs text-neutral-500">{order.createdAt.toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>
      <Pagination page={orders.page} pages={orders.pages} href={(next) => pageHref("/admin/pedidos", {}, next)} />
    </div>
  );
}
