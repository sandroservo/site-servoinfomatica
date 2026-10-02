import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveBrandAction } from "@/app/admin/actions";
import { RecordForm } from "@/components/admin/record-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar marca" };

const inputClass = "h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const brand = await prisma.brand.findUnique({ where: { id: (await params).id } });
  if (!brand) notFound();

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Marcas</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Editar marca</h1>
      <div className="mt-6 max-w-xl rounded-3xl bg-white p-5">
        <RecordForm action={saveBrandAction} submit="Salvar marca">
          <input type="hidden" name="id" value={brand.id} />
          <label className="block text-sm font-medium">
            Nome
            <input name="name" defaultValue={brand.name} required className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Slug
            <input name="slug" defaultValue={brand.slug} required className={inputClass} />
          </label>
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt="" className="h-12 max-w-[180px] object-contain" />
          ) : null}
          <label className="block text-sm font-medium">
            Logo
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="mt-1 block w-full text-sm" />
            <span className="mt-1 block text-xs font-normal text-neutral-500">Envie um arquivo novo só se quiser trocar a logo.</span>
          </label>
        </RecordForm>
        <Link href="/admin/marcas" className="mt-4 inline-block text-sm text-neutral-500 hover:text-black">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
