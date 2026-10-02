import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { getCategoryBySlug, listBrands, listProducts, parseFilters } from "@/lib/catalog";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return { title: category?.name ?? "Categoria" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const query = await searchParams;
  const filters = { ...parseFilters(query), categoria: slug };
  const [products, brands] = await Promise.all([listProducts(filters), listBrands()]);

  return (
    <CatalogView
      eyebrow="Categoria"
      title={category.name}
      description={category.description}
      action={`/categoria/${slug}`}
      filters={filters}
      products={products}
      brands={brands}
      page={parsePage(query.page)}
    />
  );
}
