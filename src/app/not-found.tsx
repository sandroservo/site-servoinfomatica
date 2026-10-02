import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Página não encontrada</h1>
      <Link href="/notebooks" className="mt-8 inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
