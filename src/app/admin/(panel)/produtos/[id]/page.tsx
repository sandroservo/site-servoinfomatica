import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm, emptyProduct, type ProductFormValues } from "@/components/admin/product-form";
import { getAdminProduct } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const specDefaults = (({
  screenInches, resolution, refreshRate, panel, processor, processorFamily, generation, cores, threads, ramGb, ramType,
  ramMaxGb, ssdGb, gpu, gpuType, os, wifi, bluetooth, hdmi, usb, usbC, ethernet, battery, charger, weightKg, widthMm,
  heightMm, depthMm, color,
}) => ({
  screenInches, resolution, refreshRate, panel, processor, processorFamily, generation, cores, threads, ramGb, ramType,
  ramMaxGb, ssdGb, gpu, gpuType, os, wifi, bluetooth, hdmi, usb, usbC, ethernet, battery, charger, weightKg, widthMm,
  heightMm, depthMm, color,
}))(emptyProduct);
export const metadata: Metadata = { title: "Editar produto" };

function cents(value: number | null) {
  if (value == null) return "";
  return (value / 100).toFixed(2).replace(".", ",");
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { id } = await params;
  const { salvo } = await searchParams;
  const product = await getAdminProduct(id);
  if (!product?.inventory) notFound();

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const { id: _specId, productId: _specProductId, ...spec } = product.spec ?? { id: "", productId: "", ...specDefaults };
  const values: ProductFormValues = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    ean: product.ean ?? "",
    brandId: product.brandId,
    categoryId: product.categoryId,
    purpose: product.purpose,
    summary: product.summary,
    description: product.description,
    price: cents(product.priceCents),
    promoPrice: cents(product.promoPriceCents),
    pixDiscountPercent: product.pixDiscountPercent,
    warrantyMonths: product.warrantyMonths,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
    isLaunch: product.isLaunch,
    isDeal: product.isDeal,
    active: product.active,
    images: product.images.map((image) => image.url).join("\n"),
    hasSpec: Boolean(product.spec),
    ...spec,
    physical: product.inventory.physical,
    reserved: product.inventory.reserved,
    minimum: product.inventory.minimum,
  };
  void _specId;
  void _specProductId;

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Produtos</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl font-semibold">{product.name}</h1>
        {product.active ? (
          <Link href={`/produto/${product.slug}`} className="text-sm font-semibold text-primary">
            Ver na loja
          </Link>
        ) : null}
      </div>
      {product.hiperId ? (
        <p className="mt-4 max-w-5xl rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Produto do ERP Hiper (código {product.hiperCode}). Nome, preço, estoque, situação e fotos são atualizados pelo Hiper a cada
          sincronização. Aqui você ajusta o que é só da loja: categoria, promoção, destaque, Pix, garantia e ficha técnica.
        </p>
      ) : null}
      <div className="mt-6 max-w-5xl">
        <ProductForm product={values} brands={brands} categories={categories} saved={salvo === "1"} />
      </div>
    </div>
  );
}
