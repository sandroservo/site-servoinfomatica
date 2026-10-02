import { ProductCard } from "@/components/product-card";
import { CatalogFilters } from "@/components/catalog-filters";
import { Pagination } from "@/components/pagination";
import type { CatalogFilters as Filters, CatalogProduct } from "@/lib/catalog";
import { pageHref, paginate } from "@/lib/pagination";

export function CatalogView({
  eyebrow,
  title,
  description,
  action,
  filters,
  products,
  brands,
  hidden,
  page = 1,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  filters: Filters;
  products: CatalogProduct[];
  brands: { name: string; slug: string }[];
  hidden?: Record<string, string>;
  page?: number;
}) {
  const listing = paginate(products, page);
  const query = catalogQuery(filters, hidden);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-neutral-500">{description}</p>
        </div>
        <p className="text-sm text-neutral-500">
          {listing.total} {listing.total === 1 ? "notebook" : "notebooks"}
        </p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <CatalogFilters action={action} filters={filters} brands={brands} hidden={hidden} />
        {listing.total ? (
          <div>
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {listing.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination page={listing.page} pages={listing.pages} href={(next) => pageHref(action, query, next)} />
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-black/10 px-6 text-center">
            <div>
              <p className="font-display text-2xl">Nenhum notebook com esses filtros</p>
              <p className="mt-2 text-sm text-neutral-500">Limpe a seleção ou busque por outra marca.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function catalogQuery(filters: Filters, hidden?: Record<string, string>) {
  const query: Record<string, string | undefined> = { ...hidden };
  const set = (key: string, value?: string | number | boolean) => {
    if (value === undefined || value === false || value === "") return;
    query[key] = value === true ? "1" : String(value);
  };
  set("q", filters.q);
  set("marca", filters.marca);
  set("tela", filters.tela);
  set("peso", filters.peso);
  set("processador", filters.processador);
  set("ram", filters.ram);
  set("ssd", filters.ssd);
  set("gpu", filters.gpu);
  set("sistema", filters.sistema);
  set("finalidade", filters.finalidade);
  set("estoque", filters.estoque);
  set("ordem", filters.ordem);
  set("min", filters.min);
  set("max", filters.max);
  set("oferta", filters.oferta);
  set("lancamento", filters.lancamento);
  set("destaque", filters.destaque);
  return query;
}
