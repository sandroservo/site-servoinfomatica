import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveCategoryAction } from "@/app/admin/actions";
import { RecordForm } from "@/components/admin/record-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar categoria" };

const inputClass = "h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const category = await prisma.category.findUnique({ where: { id: (await params).id } });
  if (!category) notFound();

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Categorias</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Editar categoria</h1>
      <div className="mt-6 max-w-xl rounded-3xl bg-white p-5">
        <RecordForm action={saveCategoryAction} submit="Salvar categoria">
          <input type="hidden" name="id" value={category.id} />
          <label className="block text-sm font-medium">
            Nome
            <input name="name" defaultValue={category.name} required className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Slug
            <input name="slug" defaultValue={category.slug} required className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Descrição
            <textarea name="description" defaultValue={category.description} rows={3} className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block text-sm font-medium">
            Ordem
            <input name="sortOrder" type="number" defaultValue={category.sortOrder} className={inputClass} />
          </label>
        </RecordForm>
        <Link href="/admin/categorias" className="mt-4 inline-block text-sm text-neutral-500 hover:text-black">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
