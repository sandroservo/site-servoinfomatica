import type { Metadata } from "next";
import Link from "next/link";
import { saveStockAction } from "@/app/admin/actions";
import { Pagination } from "@/components/pagination";
import { availableUnits } from "@/lib/catalog";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Estoque" };

export default async function StockAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; erro?: string; page?: string }>;
}) {
  const { salvo, erro, page } = await searchParams;
  const products = paginate(
    await prisma.product.findMany({
      include: { brand: true, inventory: true },
      orderBy: { name: "asc" },
    }),
    parsePage(page),
  );

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Operação</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Estoque</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-500">
        Disponível = físico − reservado. A loja só mostra compra quando há disponível.
      </p>
      {salvo ? <p className="mt-4 text-sm text-emerald-700">Estoque atualizado.</p> : null}
      {erro ? <p className="mt-4 text-sm text-primary">{erro}</p> : null}
      <div className="mt-6 space-y-3">
        {products.items.map((product) => (
          <form key={product.id} action={saveStockAction} className="grid items-end gap-3 rounded-3xl bg-white p-4 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_auto]">
            <input type="hidden" name="productId" value={product.id} />
            <div>
              <Link href={`/admin/produtos/${product.id}`} className="font-medium hover:text-primary">
                {product.name}
              </Link>
              <p className="text-xs text-neutral-500">
                {product.brand.name} · disponível {availableUnits(product)}
              </p>
            </div>
            <label className="text-xs text-neutral-500">
              Físico
              <input name="physical" type="number" min={0} defaultValue={product.inventory?.physical ?? 0} className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 text-sm" />
            </label>
            <label className="text-xs text-neutral-500">
              Reservado
              <input name="reserved" type="number" min={0} defaultValue={product.inventory?.reserved ?? 0} className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 text-sm" />
            </label>
            <label className="text-xs text-neutral-500">
              Mínimo
              <input name="minimum" type="number" min={0} defaultValue={product.inventory?.minimum ?? 2} className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 text-sm" />
            </label>
            <p className="pb-3 text-sm font-medium">{availableUnits(product)} disp.</p>
            <button type="submit" className="h-11 rounded-full bg-black px-4 text-sm font-semibold text-white">
              Salvar
            </button>
          </form>
        ))}
      </div>
      <Pagination page={products.page} pages={products.pages} href={(next) => pageHref("/admin/estoque", {}, next)} />
    </div>
  );
}
