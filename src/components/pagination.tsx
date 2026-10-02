import Link from "next/link";

export function Pagination({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;

  const numbers = Array.from({ length: pages }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`inline-flex h-10 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-black"}`}
      >
        Anterior
      </Link>
      <div className="flex flex-wrap justify-center gap-1">
        {numbers.map((number) => (
          <Link
            key={number}
            href={href(number)}
            aria-current={number === page ? "page" : undefined}
            className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${number === page ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"}`}
          >
            {number}
          </Link>
        ))}
      </div>
      <Link
        href={href(Math.min(pages, page + 1))}
        aria-disabled={page >= pages}
        className={`inline-flex h-10 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold ${page >= pages ? "pointer-events-none opacity-40" : "hover:border-black"}`}
      >
        Próxima
      </Link>
    </nav>
  );
}
