import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { getBrandBySlug, listBrands, listProducts, parseFilters } from "@/lib/catalog";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const brand = await getBrandBySlug((await params).slug);
  return { title: brand?.name ?? "Marca" };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const query = await searchParams;
  const filters = { ...parseFilters(query), marca: slug };
  const [products, brands] = await Promise.all([listProducts(filters), listBrands()]);

  return (
    <CatalogView
      eyebrow="Marca"
      title={brand.name}
      description={`Produtos ${brand.name} disponíveis no catálogo da Servo Informática.`}
      action={`/marca/${slug}`}
      filters={filters}
      products={products}
      brands={brands}
      hidden={{ marca: slug }}
      page={parsePage(query.page)}
    />
  );
}
