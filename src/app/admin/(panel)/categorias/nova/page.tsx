import Link from "next/link";
import type { Metadata } from "next";
import { saveCategoryAction } from "@/app/admin/actions";
import { RecordForm } from "@/components/admin/record-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nova categoria" };

const inputClass = "h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none";

export default async function NewCategoryPage() {
  const count = await prisma.category.count();

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Categorias</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Nova categoria</h1>
      <div className="mt-6 max-w-xl rounded-3xl bg-white p-5">
        <RecordForm action={saveCategoryAction} submit="Adicionar categoria">
          <input name="name" placeholder="Nome" required className={inputClass} />
          <input name="slug" placeholder="Slug (opcional)" className={inputClass} />
          <textarea name="description" placeholder="Descrição" rows={3} className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none" />
          <input name="sortOrder" type="number" defaultValue={count + 1} className={inputClass} />
        </RecordForm>
        <Link href="/admin/categorias" className="mt-4 inline-block text-sm text-neutral-500 hover:text-black">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
