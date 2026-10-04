import Image from "next/image";
import Link from "next/link";
import { imageUnoptimized } from "@/lib/utils";
import { availableUnits, type CatalogProduct } from "@/lib/catalog";
import { effectivePriceCents, formatBRL, installmentCents, pixPriceCents } from "@/lib/money";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images[0];
  const price = effectivePriceCents(product.priceCents, product.promoPriceCents);
  const pix = pixPriceCents(price, product.pixDiscountPercent);
  const units = availableUnits(product);
  const off = product.promoPriceCents ? Math.round((1 - price / product.priceCents) * 100) : 0;
  const href = `/produto/${product.slug}`;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-black/10 bg-white p-4 transition hover:border-black/25 hover:shadow-lg">
      <Link href={href} className="relative block">
        <div className="absolute left-0 top-0 z-10 flex flex-col items-start gap-1">
          {off > 0 ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white">{off}% OFF</span>
          ) : null}
          {product.isLaunch ? (
            <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">Lançamento</span>
          ) : null}
          {units <= 0 ? (
            <span className="rounded-full bg-neutral-500 px-2.5 py-1 text-[11px] font-bold text-white">Esgotado</span>
          ) : units <= 3 ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-white">Últimas unidades</span>
          ) : null}
        </div>
        {image ? (
          <Image
            src={image.url}
            unoptimized={imageUnoptimized(image.url)}
            alt={image.alt}
            width={600}
            height={450}
            sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 80vw"
            className={`aspect-[4/3] w-full object-contain transition duration-500 group-hover:scale-[1.04] ${units <= 0 ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="aspect-[4/3] rounded-xl bg-neutral-100" />
        )}
      </Link>

      <div className="mt-3 h-0.5 w-full bg-black" />

      <div className="flex flex-1 flex-col pt-3 text-center">
        <Link href={href} className="line-clamp-2 min-h-10 text-sm leading-5 text-neutral-800 hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto pt-3">
          <p className="flex items-baseline justify-center gap-2">
            {product.promoPriceCents ? (
              <span className="text-xs text-neutral-500 line-through">{formatBRL(product.priceCents)}</span>
            ) : null}
            <span className="font-display text-xl font-bold tracking-tight">{formatBRL(price)}</span>
          </p>
          <p className="mt-0.5 text-sm font-semibold text-emerald-600">{formatBRL(pix)} no Pix</p>
          <p className="mt-0.5 text-xs text-neutral-600">
            <strong>10x</strong> de <strong>{formatBRL(installmentCents(price))}</strong> no cartão
          </p>
        </div>
        <Link
          href={href}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-black text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-primary"
        >
          {units > 0 ? "Comprar" : "Ver detalhes"}
        </Link>
      </div>
    </article>
  );
}
