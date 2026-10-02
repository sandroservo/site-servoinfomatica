import Link from "next/link";
import type { Metadata } from "next";
import { deleteBrandAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/pagination";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Marcas" };

export default async function BrandsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; excluido?: string; erro?: string; page?: string }>;
}) {
  const { salvo, excluido, erro, page } = await searchParams;
  const brands = paginate(
    await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    parsePage(page),
  );

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Marcas</h1>
        </div>
        <Link href="/admin/marcas/nova" className="inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white">
          Adicionar
        </Link>
      </div>
      {salvo ? <p className="mt-4 text-sm text-emerald-700">Marca salva.</p> : null}
      {excluido ? <p className="mt-4 text-sm text-emerald-700">Marca excluída.</p> : null}
      {erro ? <p className="mt-4 text-sm text-primary">{erro}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {brands.items.map((brand) => (
          <article key={brand.id} className="flex flex-col rounded-3xl bg-white p-5">
            <div className="flex h-16 items-center rounded-2xl bg-neutral-50 px-4">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt="" className="max-h-10 max-w-[160px] object-contain" />
              ) : (
                <span className="text-xs text-neutral-400">Sem logo</span>
              )}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {brand._count.products} {brand._count.products === 1 ? "produto" : "produtos"}
            </p>
            <h2 className="mt-2 font-display text-2xl">{brand.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{brand.slug}</p>
            <div className="mt-5 flex gap-2">
              <Link href={`/admin/marcas/${brand.id}`} className="inline-flex h-9 items-center rounded-full bg-black px-3 text-sm font-semibold text-white">
                Editar
              </Link>
              <DeleteButton action={deleteBrandAction} id={brand.id} label={brand.name} />
            </div>
          </article>
        ))}
      </div>
      <Pagination page={brands.page} pages={brands.pages} href={(next) => pageHref("/admin/marcas", {}, next)} />
    </div>
  );
}
