import Link from "next/link";
import type { Metadata } from "next";
import { deleteCategoryAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/pagination";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; excluido?: string; erro?: string; page?: string }>;
}) {
  const { salvo, excluido, erro, page } = await searchParams;
  const categories = paginate(
    await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    parsePage(page),
  );

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Categorias</h1>
        </div>
        <Link href="/admin/categorias/nova" className="inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white">
          Adicionar
        </Link>
      </div>
      {salvo ? <p className="mt-4 text-sm text-emerald-700">Categoria salva.</p> : null}
      {excluido ? <p className="mt-4 text-sm text-emerald-700">Categoria excluída.</p> : null}
      {erro ? <p className="mt-4 text-sm text-primary">{erro}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.items.map((category) => (
          <article key={category.id} className="flex flex-col rounded-3xl bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {category._count.products} {category._count.products === 1 ? "produto" : "produtos"}
            </p>
            <h2 className="mt-2 font-display text-2xl">{category.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{category.slug}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">{category.description}</p>
            <div className="mt-5 flex gap-2">
              <Link href={`/admin/categorias/${category.id}`} className="inline-flex h-9 items-center rounded-full bg-black px-3 text-sm font-semibold text-white">
                Editar
              </Link>
              <DeleteButton action={deleteCategoryAction} id={category.id} label={category.name} />
            </div>
          </article>
        ))}
      </div>
      <Pagination page={categories.page} pages={categories.pages} href={(next) => pageHref("/admin/categorias", {}, next)} />
    </div>
  );
}
