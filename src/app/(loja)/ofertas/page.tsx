import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";
import { listBrands, listProducts, parseFilters } from "@/lib/catalog";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ofertas" };

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = { ...parseFilters(params), oferta: true };
  const [products, brands] = await Promise.all([listProducts(filters), listBrands()]);

  return (
    <CatalogView
      eyebrow="Promoções"
      title="Ofertas"
      description="Produtos com preço promocional. O valor final continua sendo validado no pedido."
      action="/ofertas"
      filters={filters}
      products={products}
      brands={brands}
      hidden={{ oferta: "1" }}
      page={parsePage(params.page)}
    />
  );
}
