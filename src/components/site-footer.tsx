import Link from "next/link";
import type { StoreInfo } from "@/lib/store";

const columns = [
  {
    title: "Categorias",
    links: [
      ["Notebooks compactos", "/categoria/compactos"],
      ['Até 14"', "/categoria/ate-14"],
      ['15,6"', "/categoria/tela-156"],
      ["Gamer", "/categoria/gamer"],
      ["Estudo", "/categoria/estudo"],
    ],
  },
  {
    title: "Loja",
    links: [
      ["Todos os notebooks", "/notebooks"],
      ["Ofertas", "/ofertas"],
      ["Lançamentos", "/lancamentos"],
      ["Comparar", "/comparar"],
      ["Carrinho", "/carrinho"],
    ],
  },
  {
    title: "Atendimento",
    links: [
      ["Buscar", "/buscar"],
      ["Marcas", "/notebooks"],
    ],
  },
];

export function SiteFooter({ brands, store }: { brands: { name: string; slug: string }[]; store: StoreInfo }) {
  return (
    <footer className="mt-auto bg-[#111] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <p className="font-display text-2xl font-semibold">Servo Informática</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
            Catálogo de notebooks da loja física e da loja virtual, com o mesmo
            produto, preço e estoque.
          </p>
          <p className="mt-6 text-sm text-white/65">
            {store.hours}
            {store.phoneDisplay ? ` · ${store.phoneDisplay}` : ""}
            {store.email ? ` · ${store.email}` : ""}
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                {column.links.map(([label, href]) => (
                  <li key={href + label}>
                    <Link href={href} className="hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-4 py-5 text-xs text-white/45 sm:px-6">
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/marca/${brand.slug}`} className="hover:text-white">
              {brand.name}
            </Link>
          ))}
          <span className="ml-auto">© {new Date().getFullYear()} Servo Informática</span>
        </div>
      </div>
    </footer>
  );
}
