import Link from "next/link";
import type { Metadata } from "next";
import { saveBrandAction } from "@/app/admin/actions";
import { RecordForm } from "@/components/admin/record-form";

export const metadata: Metadata = { title: "Nova marca" };

const inputClass = "h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none";

export default function NewBrandPage() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Marcas</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Nova marca</h1>
      <div className="mt-6 max-w-xl rounded-3xl bg-white p-5">
        <RecordForm action={saveBrandAction} submit="Adicionar marca">
          <label className="block text-sm font-medium">
            Nome
            <input name="name" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Slug
            <input name="slug" placeholder="Opcional" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Logo
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="mt-1 block w-full text-sm" />
          </label>
        </RecordForm>
        <Link href="/admin/marcas" className="mt-4 inline-block text-sm text-neutral-500 hover:text-black">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
