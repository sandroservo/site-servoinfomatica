import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CompareButton } from "@/components/compare-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Button } from "@/components/ui/button";
import {
  availableUnits,
  getProductBySlug,
  listProducts,
  specLine,
  stockLabel,
} from "@/lib/catalog";
import { effectivePriceCents, formatBRL, installmentCents, pixPriceCents } from "@/lib/money";
import { getStore } from "@/lib/settings";
import { productWhatsappHref } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product?.name ?? "Produto" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product?.spec) notFound();

  const price = effectivePriceCents(product.priceCents, product.promoPriceCents);
  const units = availableUnits(product);
  const whatsapp = productWhatsappHref((await getStore()).whatsapp, product.name);
  const related = (
    await listProducts({ categoria: product.category.slug })
  )
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const rows = [
    ["Tela", `${product.spec.screenInches.toLocaleString("pt-BR")}" ${product.spec.resolution}`],
    ["Taxa", `${product.spec.refreshRate} Hz`],
    ["Painel", product.spec.panel],
    ["Processador", product.spec.processor],
    ["Geração", product.spec.generation],
    ["Núcleos / threads", `${product.spec.cores} / ${product.spec.threads}`],
    ["Memória", `${product.spec.ramGb} GB ${product.spec.ramType}`],
    ["Máximo de RAM", `${product.spec.ramMaxGb} GB`],
    ["SSD", product.spec.ssdGb >= 1024 ? "1 TB" : `${product.spec.ssdGb} GB`],
    ["GPU", product.spec.gpu],
    ["Sistema", product.spec.os],
    ["Wi-Fi", product.spec.wifi],
    ["Bluetooth", product.spec.bluetooth],
    ["HDMI", product.spec.hdmi ? "Sim" : "Não"],
    ["USB", product.spec.usb],
    ["USB-C", product.spec.usbC],
    ["Ethernet", product.spec.ethernet ? "Sim" : "Não"],
    ["Bateria", product.spec.battery],
    ["Carregador", product.spec.charger],
    ["Peso", `${product.spec.weightKg.toLocaleString("pt-BR")} kg`],
    ["Dimensões", `${product.spec.widthMm} × ${product.spec.depthMm} × ${product.spec.heightMm} mm`],
    ["Cor", product.spec.color],
    ["Garantia", `${product.warrantyMonths} meses`],
    ["SKU", product.sku],
    ["EAN", product.ean ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm text-neutral-500">
        <Link href="/notebooks" className="hover:text-black">Notebooks</Link>
        {" / "}
        <Link href={`/categoria/${product.category.slug}`} className="hover:text-black">
          {product.category.name}
        </Link>
        {" / "}
        <Link href={`/marca/${product.brand.slug}`} className="hover:text-black">
          {product.brand.name}
        </Link>
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <ProductGallery images={product.images} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {product.brand.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg font-medium">{specLine(product)}</p>
          <p className="mt-3 max-w-xl text-neutral-500">{product.summary}</p>

          <div className="mt-8 border-y border-black/10 py-6">
            {product.promoPriceCents ? (
              <p className="text-sm text-neutral-400 line-through">{formatBRL(product.priceCents)}</p>
            ) : null}
            <p className="font-display text-5xl font-semibold tracking-tight">{formatBRL(price)}</p>
            <p className="mt-2 text-neutral-600">
              ou 10x de {formatBRL(installmentCents(price))}
            </p>
            <p className="mt-1 text-sm font-semibold text-secondary">
              {formatBRL(pixPriceCents(price, product.pixDiscountPercent))} no Pix ({product.pixDiscountPercent}% off)
            </p>
            <p className="mt-3 text-sm">
              {stockLabel(units)}
              {units > 0 ? ` · ${units} disponível${units > 1 ? "is" : ""}` : ""}
              {" · "}
              Garantia {product.warrantyMonths} meses
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton slug={product.slug} disabled={units <= 0} label="Comprar" />
            {whatsapp ? (
              <Button asChild variant="outline">
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  Falar no WhatsApp
                </a>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                WhatsApp da loja
              </Button>
            )}
            <CompareButton slug={product.slug} />
          </div>
          <p className="mt-6 text-sm leading-6 text-neutral-600">{product.description}</p>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">Ficha técnica</h2>
        <dl className="mt-6 divide-y divide-black/5 rounded-3xl border border-black/5">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="text-sm text-neutral-500">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl font-semibold">Relacionados</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
