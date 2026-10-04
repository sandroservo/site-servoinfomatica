"use client";

import { useActionState } from "react";
import { filterOptions } from "@/lib/catalog";
import { saveProductAction } from "@/app/admin/actions";

type Brand = { id: string; name: string };
type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  ean: string;
  brandId: string;
  categoryId: string;
  purpose: string;
  summary: string;
  description: string;
  price: string;
  promoPrice: string;
  pixDiscountPercent: number;
  warrantyMonths: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  isLaunch: boolean;
  isDeal: boolean;
  active: boolean;
  images: string;
  hasSpec: boolean;
  screenInches: number;
  resolution: string;
  refreshRate: number;
  panel: string;
  processor: string;
  processorFamily: string;
  generation: string;
  cores: number;
  threads: number;
  ramGb: number;
  ramType: string;
  ramMaxGb: number;
  ssdGb: number;
  gpu: string;
  gpuType: string;
  os: string;
  wifi: string;
  bluetooth: string;
  hdmi: boolean;
  usb: string;
  usbC: string;
  ethernet: boolean;
  battery: string;
  charger: string;
  weightKg: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  color: string;
  physical: number;
  reserved: number;
  minimum: number;
};

const inputClass =
  "mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue} className={inputClass} />
    </label>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

export function ProductForm({
  product,
  brands,
  categories,
  saved,
}: {
  product: ProductFormValues;
  brands: Brand[];
  categories: Category[];
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveProductAction, null);

  return (
    <form action={action} className="space-y-6">
      {product.id ? <input type="hidden" name="id" value={product.id} /> : null}
      {saved ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Produto salvo. A loja já usa estes dados.</p> : null}
      {state?.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-primary">{state.error}</p> : null}

      <section className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl">Identificação</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome" name="name" defaultValue={product.name} required />
          <Field label="Slug" name="slug" defaultValue={product.slug} />
          <Field label="SKU" name="sku" defaultValue={product.sku} required />
          <Field label="EAN" name="ean" defaultValue={product.ean} />
          <label className="block text-sm">
            <span className="font-medium">Marca</span>
            <select name="brandId" defaultValue={product.brandId} required className={inputClass}>
              <option value="">Selecione</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Categoria</span>
            <select name="categoryId" defaultValue={product.categoryId} required className={inputClass}>
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Finalidade</span>
            <select name="purpose" defaultValue={product.purpose} className={inputClass}>
              {filterOptions.finalidades.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <Field label="Garantia (meses)" name="warrantyMonths" type="number" defaultValue={product.warrantyMonths} />
        </div>
        <label className="mt-4 block text-sm">
          <span className="font-medium">Resumo</span>
          <input name="summary" defaultValue={product.summary} className={inputClass} />
        </label>
        <label className="mt-4 block text-sm">
          <span className="font-medium">Descrição</span>
          <textarea name="description" defaultValue={product.description} rows={4} className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black" />
        </label>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl">Preço e vitrine</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Preço (R$)" name="price" defaultValue={product.price} required />
          <Field label="Preço promocional (R$)" name="promoPrice" defaultValue={product.promoPrice} />
          <Field label="Desconto Pix (%)" name="pixDiscountPercent" type="number" defaultValue={product.pixDiscountPercent} />
          <Field label="Avaliação" name="rating" defaultValue={product.rating} />
          <Field label="Avaliações" name="reviewCount" type="number" defaultValue={product.reviewCount} />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Check name="active" label="Ativo na loja" defaultChecked={product.active} />
          <Check name="featured" label="Destaque" defaultChecked={product.featured} />
          <Check name="isLaunch" label="Lançamento" defaultChecked={product.isLaunch} />
          <Check name="isDeal" label="Oferta" defaultChecked={product.isDeal} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl">Ficha técnica de notebook</h2>
        <div className="mt-3">
          <Check name="hasSpec" label="Este produto é um notebook (mostrar a ficha abaixo na loja e nos filtros)" defaultChecked={product.hasSpec} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label='Tela (pol.)' name="screenInches" defaultValue={product.screenInches} />
          <Field label="Resolução" name="resolution" defaultValue={product.resolution} />
          <Field label="Hz" name="refreshRate" type="number" defaultValue={product.refreshRate} />
          <Field label="Painel" name="panel" defaultValue={product.panel} />
          <label className="block text-sm">
            <span className="font-medium">Família do processador</span>
            <select name="processorFamily" defaultValue={product.processorFamily} className={inputClass}>
              {filterOptions.processadores.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <Field label="Processador" name="processor" defaultValue={product.processor} />
          <Field label="Geração" name="generation" defaultValue={product.generation} />
          <Field label="Núcleos" name="cores" type="number" defaultValue={product.cores} />
          <Field label="Threads" name="threads" type="number" defaultValue={product.threads} />
          <Field label="RAM (GB)" name="ramGb" type="number" defaultValue={product.ramGb} />
          <Field label="Tipo de RAM" name="ramType" defaultValue={product.ramType} />
          <Field label="RAM máxima (GB)" name="ramMaxGb" type="number" defaultValue={product.ramMaxGb} />
          <Field label="SSD (GB)" name="ssdGb" type="number" defaultValue={product.ssdGb} />
          <label className="block text-sm">
            <span className="font-medium">Tipo de GPU</span>
            <select name="gpuType" defaultValue={product.gpuType} className={inputClass}>
              {filterOptions.gpus.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <Field label="GPU" name="gpu" defaultValue={product.gpu} />
          <Field label="Sistema" name="os" defaultValue={product.os} />
          <Field label="Peso (kg)" name="weightKg" defaultValue={product.weightKg} />
          <Field label="Cor" name="color" defaultValue={product.color} />
          <Field label="Wi-Fi" name="wifi" defaultValue={product.wifi} />
          <Field label="Bluetooth" name="bluetooth" defaultValue={product.bluetooth} />
          <Field label="USB" name="usb" defaultValue={product.usb} />
          <Field label="USB-C" name="usbC" defaultValue={product.usbC} />
          <Field label="Bateria" name="battery" defaultValue={product.battery} />
          <Field label="Carregador" name="charger" defaultValue={product.charger} />
          <Field label="Largura (mm)" name="widthMm" defaultValue={product.widthMm} />
          <Field label="Profundidade (mm)" name="depthMm" defaultValue={product.depthMm} />
          <Field label="Altura (mm)" name="heightMm" defaultValue={product.heightMm} />
        </div>
        <div className="mt-4 flex gap-4">
          <Check name="hdmi" label="HDMI" defaultChecked={product.hdmi} />
          <Check name="ethernet" label="Ethernet" defaultChecked={product.ethernet} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl">Estoque</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Físico" name="physical" type="number" defaultValue={product.physical} />
          <Field label="Reservado" name="reserved" type="number" defaultValue={product.reserved} />
          <Field label="Mínimo" name="minimum" type="number" defaultValue={product.minimum} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl">Fotos</h2>
        <p className="mt-1 text-sm text-neutral-500">Uma URL por linha. Pode usar as fotos em /products/ ou um endereço externo.</p>
        <textarea name="images" defaultValue={product.images} rows={4} className="mt-3 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black" />
      </section>

      <button type="submit" disabled={pending} className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Salvando…" : "Salvar produto"}
      </button>
    </form>
  );
}

export const emptyProduct = {
  name: "",
  slug: "",
  sku: "",
  ean: "",
  brandId: "",
  categoryId: "",
  purpose: "profissional",
  summary: "",
  description: "",
  price: "",
  promoPrice: "",
  pixDiscountPercent: 5,
  warrantyMonths: 12,
  rating: 0,
  reviewCount: 0,
  featured: false,
  isLaunch: false,
  isDeal: false,
  active: true,
  images: "/products/laptop-02.jpg",
  hasSpec: true,
  screenInches: 14,
  resolution: "1920x1080",
  refreshRate: 60,
  panel: "IPS",
  processor: "Intel Core i5",
  processorFamily: "Intel Core i5",
  generation: "13ª geração",
  cores: 10,
  threads: 12,
  ramGb: 16,
  ramType: "DDR4",
  ramMaxGb: 32,
  ssdGb: 512,
  gpu: "Intel Iris Xe",
  gpuType: "integrada",
  os: "Windows 11",
  wifi: "Wi-Fi 6",
  bluetooth: "5.1",
  hdmi: true,
  usb: "2x USB-A",
  usbC: "1x USB-C",
  ethernet: false,
  battery: "Até 8 horas",
  charger: "65 W",
  weightKg: 1.4,
  widthMm: 322,
  heightMm: 18,
  depthMm: 215,
  color: "Cinza",
  physical: 1,
  reserved: 0,
  minimum: 2,
} satisfies ProductFormValues;
