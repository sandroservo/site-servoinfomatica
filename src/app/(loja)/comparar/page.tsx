import type { Metadata } from "next";
import Link from "next/link";
import { listProducts } from "@/lib/catalog";
import { effectivePriceCents, formatBRL, pixPriceCents } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Comparar" };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.itens;
  const slugs = (Array.isArray(raw) ? raw.join(",") : raw ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 3);

  const products = slugs.length ? await listProducts({ slugs }) : [];
  const ordered = slugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const rows: { label: string; value: (product: (typeof ordered)[number]) => string }[] = [
    { label: "Preço", value: (product) => formatBRL(effectivePriceCents(product.priceCents, product.promoPriceCents)) },
    {
      label: "Pix",
      value: (product) =>
        formatBRL(
          pixPriceCents(
            effectivePriceCents(product.priceCents, product.promoPriceCents),
            product.pixDiscountPercent,
          ),
        ),
    },
    { label: "Tela", value: (product) => (product.spec ? `${product.spec.screenInches}"` : "—") },
    { label: "Peso", value: (product) => (product.spec ? `${product.spec.weightKg} kg` : "—") },
    { label: "Processador", value: (product) => product.spec?.processor ?? "—" },
    { label: "RAM", value: (product) => (product.spec ? `${product.spec.ramGb} GB` : "—") },
    { label: "SSD", value: (product) => (product.spec ? `${product.spec.ssdGb} GB` : "—") },
    { label: "GPU", value: (product) => product.spec?.gpu ?? "—" },
    { label: "Sistema", value: (product) => product.spec?.os ?? "—" },
    { label: "Bateria", value: (product) => product.spec?.battery ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Comparador</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Compare até 3 notebooks</h1>
      <p className="mt-3 max-w-2xl text-neutral-500">
        Abra um produto e use Comparar, ou monte o endereço com os slugs separados por vírgula.
      </p>
      {ordered.length === 0 ? (
        <Link href="/notebooks" className="mt-8 inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white">
          Escolher notebooks
        </Link>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="w-40" />
                {ordered.map((product) => (
                  <th key={product.id} className="border-b border-black/10 px-4 py-4 text-left align-bottom">
                    <Link href={`/produto/${product.slug}`} className="font-display text-xl font-semibold">
                      {product.name}
                    </Link>
                    <p className="mt-1 font-normal text-neutral-500">{product.brand.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th className="border-b border-black/5 px-4 py-3 text-left font-medium text-neutral-500">
                    {row.label}
                  </th>
                  {ordered.map((product) => (
                    <td key={product.id} className="border-b border-black/5 px-4 py-3">
                      {row.value(product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
