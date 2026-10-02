import type { Metadata } from "next";
import { ProductForm, emptyProduct } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Produtos</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Novo notebook</h1>
      <div className="mt-6 max-w-5xl">
        <ProductForm product={emptyProduct} brands={brands} categories={categories} />
      </div>
    </div>
  );
}
