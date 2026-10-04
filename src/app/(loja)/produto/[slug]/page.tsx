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
  if (!product?.active) notFound();

  const price = effectivePriceCents(product.priceCents, product.promoPriceCents);
  const units = availableUnits(product);
  const whatsapp = productWhatsappHref((await getStore()).whatsapp, product.name);
  const related = (
    await listProducts({ categoria: product.category.slug })
  )
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const spec = product.spec;
  // Ficha completa só para notebooks; demais produtos (vindos do Hiper) mostram os dados gerais.
  const rows: [string, string][] = [
    ...(spec
      ? ([
          ["Tela", `${spec.screenInches.toLocaleString("pt-BR")}" ${spec.resolution}`],
          ["Taxa", `${spec.refreshRate} Hz`],
          ["Painel", spec.panel],
          ["Processador", spec.processor],
          ["Geração", spec.generation],
          ["Núcleos / threads", `${spec.cores} / ${spec.threads}`],
          ["Memória", `${spec.ramGb} GB ${spec.ramType}`],
          ["Máximo de RAM", `${spec.ramMaxGb} GB`],
          ["SSD", spec.ssdGb >= 1024 ? "1 TB" : `${spec.ssdGb} GB`],
          ["GPU", spec.gpu],
          ["Sistema", spec.os],
          ["Wi-Fi", spec.wifi],
          ["Bluetooth", spec.bluetooth],
          ["HDMI", spec.hdmi ? "Sim" : "Não"],
          ["USB", spec.usb],
          ["USB-C", spec.usbC],
          ["Ethernet", spec.ethernet ? "Sim" : "Não"],
          ["Bateria", spec.battery],
          ["Carregador", spec.charger],
          ["Peso", `${spec.weightKg.toLocaleString("pt-BR")} kg`],
          ["Dimensões", `${spec.widthMm} × ${spec.depthMm} × ${spec.heightMm} mm`],
          ["Cor", spec.color],
        ] as [string, string][])
      : []),
    ["Marca", product.brand.name],
    ["Categoria", product.category.name],
    ...(product.warrantyMonths > 0 ? ([["Garantia", `${product.warrantyMonths} meses`]] as [string, string][]) : []),
    ["Código", product.sku],
    ["EAN", product.ean ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm text-neutral-500">
        <Link href="/notebooks" className="hover:text-black">Produtos</Link>
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
          {spec ? <p className="mt-4 text-lg font-medium">{specLine(product)}</p> : null}
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
              {product.warrantyMonths > 0 ? ` · Garantia ${product.warrantyMonths} meses` : ""}
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
          <p className="mt-6 whitespace-pre-line text-sm leading-6 text-neutral-600">{product.description}</p>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">{spec ? "Ficha técnica" : "Informações"}</h2>
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
