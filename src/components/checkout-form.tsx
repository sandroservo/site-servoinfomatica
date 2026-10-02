"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/money";

type Billing = "PIX" | "CREDIT_CARD";

export function CheckoutForm({ pixTotal, cardTotal }: { pixTotal: number; cardTotal: number }) {
  const { items, clear } = useCart();
  const router = useRouter();
  const [billingType, setBillingType] = useState<Billing>("PIX");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingType,
          items,
          customer: {
            name: form.get("name"),
            email: form.get("email"),
            cpfCnpj: form.get("cpfCnpj"),
            phone: form.get("phone"),
          },
        }),
      });
      const data = (await response.json()) as { orderId?: string; error?: string };
      if (!response.ok || !data.orderId) throw new Error(data.error ?? "Não foi possível finalizar.");
      clear();
      router.push(`/pedido/${data.orderId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível finalizar.");
      setSending(false);
    }
  }

  const options: { value: Billing; label: string; total: number }[] = [
    { value: "PIX", label: "Pix", total: pixTotal },
    { value: "CREDIT_CARD", label: "Cartão de crédito", total: cardTotal },
  ];

  return (
    <form onSubmit={submit} className="mt-10 rounded-3xl border border-black/5 p-6">
      <h2 className="font-display text-2xl font-semibold">Finalizar compra</h2>
      <p className="mt-1 text-sm text-neutral-500">Retirada na loja física após a confirmação do pagamento.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Nome completo
          <Input name="name" required autoComplete="name" className="mt-1" />
        </label>
        <label className="text-sm">
          E-mail
          <Input name="email" type="email" required autoComplete="email" className="mt-1" />
        </label>
        <label className="text-sm">
          Celular
          <Input name="phone" type="tel" required autoComplete="tel" placeholder="(00) 00000-0000" className="mt-1" />
        </label>
        <label className="text-sm">
          CPF ou CNPJ
          <Input name="cpfCnpj" required inputMode="numeric" className="mt-1" />
        </label>
      </div>

      <fieldset className="mt-6 grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm">Forma de pagamento</legend>
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 ${billingType === option.value ? "border-black" : "border-black/10"}`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="billingType"
                value={option.value}
                checked={billingType === option.value}
                onChange={() => setBillingType(option.value)}
              />
              {option.label}
            </span>
            <span className="font-semibold">{formatBRL(option.total)}</span>
          </label>
        ))}
      </fieldset>

      {error ? <p role="alert" className="mt-4 text-sm text-primary">{error}</p> : null}

      <Button type="submit" className="mt-6 w-full sm:w-auto" size="lg" disabled={sending}>
        {sending ? "Gerando pagamento…" : "Ir para pagamento"}
      </Button>
      <p className="mt-3 text-xs text-neutral-500">Pagamento processado com segurança pelo Asaas.</p>
    </form>
  );
}
