import Link from "next/link";
import type { Metadata } from "next";
import { deleteProductAction, duplicateProductAction, toggleProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/pagination";
import { listAdminProducts } from "@/lib/admin";
import { availableUnits } from "@/lib/catalog";
import { effectivePriceCents, formatBRL } from "@/lib/money";
import { pageHref, paginate, parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; excluido?: string; erro?: string; page?: string }>;
}) {
  const { q, excluido, erro, page } = await searchParams;
  const products = paginate(await listAdminProducts(q), parsePage(page));

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Produtos</h1>
        </div>
        <Link href="/admin/produtos/novo" className="inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white">
          Novo notebook
        </Link>
      </div>
      {excluido ? <p className="mt-4 text-sm text-emerald-700">Produto excluído.</p> : null}
      {erro ? <p className="mt-4 text-sm text-primary">{erro}</p> : null}
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, SKU ou marca"
          className="h-11 w-full max-w-md rounded-full border border-black/10 bg-white px-4 text-sm outline-none"
        />
      </form>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.items.map((product) => {
              const price = effectivePriceCents(product.priceCents, product.promoPriceCents);
              return (
                <tr key={product.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-neutral-500">{product.brand.name} · {product.sku}</p>
                  </td>
                  <td className="px-4 py-3">{formatBRL(price)}</td>
                  <td className="px-4 py-3">{availableUnits(product)}</td>
                  <td className="px-4 py-3">{product.active ? "Ativo" : "Oculto"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/produtos/${product.id}`} className="inline-flex h-9 items-center rounded-full bg-black px-3 text-sm font-semibold text-white">
                        Editar
                      </Link>
                      <DeleteButton action={deleteProductAction} id={product.id} label={product.name} />
                      <form action={toggleProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        {product.active ? <input type="hidden" name="active" value="1" /> : null}
                        <button type="submit" className="h-9 rounded-full px-3 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-black">
                          {product.active ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <form action={duplicateProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="h-9 rounded-full px-3 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-black">Duplicar</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={products.page}
        pages={products.pages}
        href={(next) => pageHref("/admin/produtos", { q }, next)}
      />
    </div>
  );
}
