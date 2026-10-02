export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function effectivePriceCents(priceCents: number, promoPriceCents: number | null) {
  return promoPriceCents ?? priceCents;
}

export function pixPriceCents(priceCents: number, pixDiscountPercent: number) {
  return Math.round((priceCents * (100 - pixDiscountPercent)) / 100);
}

export function installmentCents(priceCents: number, installments = 10) {
  return Math.round(priceCents / installments);
}
