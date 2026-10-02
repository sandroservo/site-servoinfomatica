import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";
import { listBrands, listProducts, parseFilters } from "@/lib/catalog";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lançamentos" };

export default async function LaunchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = { ...parseFilters(params), lancamento: true };
  const [products, brands] = await Promise.all([listProducts(filters), listBrands()]);

  return (
    <CatalogView
      eyebrow="Novidades"
      title="Lançamentos"
      description="Modelos marcados como lançamento no cadastro do catálogo."
      action="/lancamentos"
      filters={filters}
      products={products}
      brands={brands}
      hidden={{ lancamento: "1" }}
      page={parsePage(params.page)}
    />
  );
}
