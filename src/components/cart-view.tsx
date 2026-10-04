"use client";

import Image from "next/image";
import { imageUnoptimized } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { CheckoutForm } from "@/components/checkout-form";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { whatsappHref } from "@/lib/store";

type CartProduct = {
  slug: string;
  name: string;
  priceCentsEffective: number;
  pixCents: number;
  available: number;
  images: { url: string; alt: string }[];
};

export function CartView({ whatsapp }: { whatsapp: string }) {
  const { items, ready, setQty, remove, clear } = useCart();
  const [products, setProducts] = useState<CartProduct[]>([]);

  useEffect(() => {
    if (!ready || items.length === 0) {
      setProducts([]);
      return;
    }
    const slugs = items.map((item) => item.slug).join(",");
    fetch(`/api/products?slugs=${encodeURIComponent(slugs)}`)
      .then((response) => response.json())
      .then((data: { products: CartProduct[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, [items, ready]);

  const lines = items
    .map((item) => {
      const product = products.find((entry) => entry.slug === item.slug);
      if (!product) return null;
      return { item, product, total: product.priceCentsEffective * item.qty };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const pixTotal = lines.reduce((sum, line) => sum + line.product.pixCents * line.item.qty, 0);
  const message = lines
    .map((line) => `${line.item.qty}x ${line.product.name}`)
    .join(", ");
  const contact = whatsappHref(
    whatsapp,
    `Olá! Quero saber sobre estes produtos: ${message}. Total estimado ${formatBRL(subtotal)}.`,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Carrinho</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Seu carrinho</h1>
      {!ready || (items.length > 0 && products.length === 0) ? (
        <p className="mt-8 text-neutral-500">Carregando carrinho…</p>
      ) : lines.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-black/10 p-10 text-center">
          <p className="font-display text-2xl">O carrinho está vazio</p>
          <Button asChild className="mt-6" variant="dark">
            <Link href="/notebooks">Ver catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {lines.map(({ item, product, total }) => (
            <div key={item.slug} className="flex gap-4 rounded-3xl border border-black/5 p-4">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  unoptimized={imageUnoptimized(product.images[0].url)}
                  alt={product.images[0].alt}
                  width={160}
                  height={120}
                  className="h-24 w-32 rounded-2xl object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <Link href={`/produto/${product.slug}`} className="font-semibold">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">{formatBRL(product.priceCentsEffective)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" className="size-8 rounded-full border" onClick={() => setQty(item.slug, item.qty - 1)}>
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <button
                    type="button"
                    className="size-8 rounded-full border"
                    onClick={() => setQty(item.slug, Math.min(item.qty + 1, product.available))}
                  >
                    +
                  </button>
                  <button type="button" className="ml-3 text-sm text-neutral-500" onClick={() => remove(item.slug)}>
                    Remover
                  </button>
                </div>
              </div>
              <p className="font-display text-xl">{formatBRL(total)}</p>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-sm text-neutral-500">Subtotal</p>
              <p className="font-display text-3xl">{formatBRL(subtotal)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" type="button" onClick={clear}>
                Limpar
              </Button>
              {contact ? (
                <Button asChild variant="dark">
                  <a href={contact} target="_blank" rel="noreferrer">
                    Falar no WhatsApp
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <CheckoutForm pixTotal={pixTotal} cardTotal={subtotal} />
        </div>
      )}
    </div>
  );
}
