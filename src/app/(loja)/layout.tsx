import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFloat } from "@/components/whatsapp-float";
import { listBrands, listCategories } from "@/lib/catalog";
import { getStore } from "@/lib/settings";

const fallbackCategories = [
  { name: "Notebooks compactos", slug: "compactos" },
  { name: 'Até 14"', slug: "ate-14" },
  { name: '15,6"', slug: "tela-156" },
  { name: "Gamer", slug: "gamer" },
  { name: "Profissional", slug: "profissional" },
  { name: "Estudo", slug: "estudo" },
  { name: "Alto desempenho", slug: "alto-desempenho" },
];

export default async function StoreLayout({ children }: { children: ReactNode }) {
  let categories = fallbackCategories;
  let brands: { name: string; slug: string }[] = [];

  try {
    const [categoryRows, brandRows] = await Promise.all([listCategories(), listBrands()]);
    if (categoryRows.length) {
      categories = categoryRows.map((category) => ({ name: category.name, slug: category.slug }));
    }
    brands = brandRows.map((brand) => ({ name: brand.name, slug: brand.slug }));
  } catch {
    categories = fallbackCategories;
  }

  const store = await getStore();

  return (
    <CartProvider>
      <div className="flex min-h-full flex-col">
        <SiteHeader categories={categories} phone={store.phoneDisplay} instagram={store.instagram} whatsapp={store.whatsapp} />
        <main className="flex-1">{children}</main>
        <SiteFooter brands={brands} store={store} />
      </div>
      <WhatsappFloat whatsapp={store.whatsapp} />
    </CartProvider>
  );
}
