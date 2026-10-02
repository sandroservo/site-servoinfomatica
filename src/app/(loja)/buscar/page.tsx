import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";
import { listBrands, listProducts, parseFilters } from "@/lib/catalog";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Busca" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [products, brands] = await Promise.all([listProducts(filters), listBrands()]);
  const query = filters.q;

  return (
    <CatalogView
      eyebrow="Busca"
      title={query ? `Resultados para “${query}”` : "Buscar notebooks"}
      description="Pesquise por nome, marca, SKU ou processador."
      action="/buscar"
      filters={filters}
      products={products}
      brands={brands}
      hidden={query ? { q: query } : undefined}
      page={parsePage(params.page)}
    />
  );
}
