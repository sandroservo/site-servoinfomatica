import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { getAdminProduct } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
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
  if (!product?.spec || !product.inventory) notFound();

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const { id: _specId, productId: _specProductId, ...spec } = product.spec;
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
      <div className="mt-6 max-w-5xl">
        <ProductForm product={values} brands={brands} categories={categories} saved={salvo === "1"} />
      </div>
    </div>
  );
}
