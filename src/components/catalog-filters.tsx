import Link from "next/link";
import { filterOptions, listCategories, type CatalogFilters } from "@/lib/catalog";

type Option = { value: string; label: string };

function Field({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string | number;
  options: Option[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">{label}</span>
      <select
        name={name}
        defaultValue={value ? String(value) : ""}
        className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export async function CatalogFilters({
  action,
  filters,
  brands,
  hidden,
}: {
  action: string;
  filters: CatalogFilters;
  brands: { name: string; slug: string }[];
  hidden?: Record<string, string>;
}) {
  // Na página de uma categoria o filtro de categoria já vem fixo em "hidden".
  const categories = hidden?.categoria
    ? []
    : (await listCategories()).filter((category) => category._count.products > 0);

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-black/5 bg-white p-4">
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {categories.length ? (
          <Field
            label="Categoria"
            name="categoria"
            value={filters.categoria}
            options={categories.map((category) => ({ value: category.slug, label: category.name }))}
          />
        ) : null}
        <Field
          label="Marca"
          name="marca"
          value={filters.marca}
          options={brands.map((brand) => ({ value: brand.slug, label: brand.name }))}
        />
        <Field label="Tela" name="tela" value={filters.tela} options={filterOptions.telas} />
        <Field label="Peso" name="peso" value={filters.peso} options={filterOptions.pesos} />
        <Field
          label="Processador"
          name="processador"
          value={filters.processador}
          options={[...filterOptions.processadores]}
        />
        <Field
          label="Memória"
          name="ram"
          value={filters.ram}
          options={filterOptions.rams.map((ram) => ({ value: String(ram), label: `${ram} GB` }))}
        />
        <Field
          label="SSD"
          name="ssd"
          value={filters.ssd}
          options={filterOptions.ssds.map((ssd) => ({
            value: String(ssd),
            label: ssd >= 1024 ? "1 TB" : `${ssd} GB`,
          }))}
        />
        <Field label="GPU" name="gpu" value={filters.gpu} options={filterOptions.gpus} />
        <Field
          label="Finalidade"
          name="finalidade"
          value={filters.finalidade}
          options={filterOptions.finalidades}
        />
        <Field label="Ordenar" name="ordem" value={filters.ordem} options={filterOptions.ordens} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="estoque" value="1" defaultChecked={filters.estoque === "1"} />
        Somente em estoque
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          Mín. R$
          <input
            name="min"
            inputMode="numeric"
            defaultValue={filters.min ?? ""}
            className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 outline-none"
          />
        </label>
        <label className="block text-sm">
          Máx. R$
          <input
            name="max"
            inputMode="numeric"
            defaultValue={filters.max ?? ""}
            className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 outline-none"
          />
        </label>
      </div>
      <button type="submit" className="h-11 w-full rounded-full bg-black text-sm font-semibold text-white">
        Filtrar
      </button>
      <Link href={action} className="block text-center text-sm text-neutral-500 hover:text-black">
        Limpar filtros
      </Link>
    </form>
  );
}
