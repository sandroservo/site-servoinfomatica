import Link from "next/link";
import type { Metadata } from "next";
import { adminStats } from "@/lib/admin";
import { availableUnits } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel" };

export default async function AdminHomePage() {
  const stats = await adminStats();
  const cards = [
    ["Produtos", stats.products, "/admin/produtos"],
    ["Ativos na loja", stats.active, "/admin/produtos"],
    ["Marcas", stats.brands, "/admin/marcas"],
    ["Categorias", stats.categories, "/admin/categorias"],
    ["Ofertas", stats.deals, "/admin/produtos"],
    ["Lançamentos", stats.launches, "/admin/produtos"],
  ];

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Painel</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Catálogo da loja</h1>
      <p className="mt-2 max-w-2xl text-neutral-500">
        O que você alterar aqui aparece na vitrine: preço, ficha, fotos, destaque e estoque.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 font-display text-4xl">{value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-3xl bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl">Estoque baixo</h2>
          <Link href="/admin/estoque" className="text-sm font-semibold text-primary">Ajustar</Link>
        </div>
        {stats.lowStock.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Nenhum produto no mínimo ou abaixo dele.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {stats.lowStock.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <Link href={`/admin/produtos/${product.id}`} className="font-medium hover:text-primary">
                  {product.name}
                </Link>
                <span className="text-neutral-500">
                  {product.inventory ? availableUnits(product) : 0} disponível · mín. {product.inventory?.minimum ?? 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
