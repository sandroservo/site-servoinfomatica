import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton, OrderRefresh } from "@/components/order-live";
import { Button } from "@/components/ui/button";
import { getPixQrCode, type AsaasPixQrCode } from "@/lib/asaas";
import { formatBRL } from "@/lib/money";
import { billingTypeLabel, orderStatusLabel } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { getStore } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pedido", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const store = await getStore();
  const pending = order.status === "PENDING";
  let pix: AsaasPixQrCode | null = null;
  if (pending && order.billingType === "PIX" && order.asaasPaymentId) {
    pix = await getPixQrCode(order.asaasPaymentId).catch(() => null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {pending ? <OrderRefresh /> : null}
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pedido #{order.number}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{orderStatusLabel[order.status]}</h1>

      {order.status === "PAID" ? (
        <p className="mt-4 text-neutral-600">
          Pagamento confirmado! Separamos seu pedido para retirada. {store.address} · {store.hours}.
        </p>
      ) : null}

      {pending && pix ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-black/5 p-6 text-center">
          <p className="text-sm text-neutral-500">Escaneie o QR Code no app do seu banco ou copie o código.</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem base64 gerada pelo Asaas */}
          <img src={`data:image/png;base64,${pix.encodedImage}`} alt="QR Code Pix" className="size-64" />
          <p className="w-full break-all rounded-2xl bg-neutral-100 p-3 text-left text-xs">{pix.payload}</p>
          <CopyButton text={pix.payload} />
          <p className="text-xs text-neutral-500">Esta página atualiza sozinha quando o pagamento for confirmado.</p>
        </div>
      ) : null}

      {pending && order.billingType === "CREDIT_CARD" && order.invoiceUrl ? (
        <div className="mt-8 rounded-3xl border border-black/5 p-6">
          <p className="text-sm text-neutral-500">Conclua o pagamento com cartão no ambiente seguro do Asaas.</p>
          <Button asChild className="mt-4" size="lg">
            <a href={order.invoiceUrl} target="_blank" rel="noreferrer">
              Pagar com cartão
            </a>
          </Button>
        </div>
      ) : null}

      {pending && !pix && order.billingType === "PIX" && order.invoiceUrl ? (
        <Button asChild className="mt-8" size="lg">
          <a href={order.invoiceUrl} target="_blank" rel="noreferrer">
            Abrir cobrança Pix
          </a>
        </Button>
      ) : null}

      <div className="mt-10 space-y-2 rounded-3xl bg-neutral-50 p-6 text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <span>
              {item.qty}x {item.name}
            </span>
            <span>{formatBRL(item.unitCents * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-black/5 pt-3 font-semibold">
          <span>Total no {billingTypeLabel[order.billingType]}</span>
          <span>{formatBRL(order.totalCents)}</span>
        </div>
      </div>

      <Button asChild variant="ghost" className="mt-6">
        <Link href="/notebooks">Continuar comprando</Link>
      </Button>
    </div>
  );
}
