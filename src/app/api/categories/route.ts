import { listCategories } from "@/lib/catalog";

export async function GET() {
  const categories = await listCategories();
  return Response.json({
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category._count.products,
    })),
  });
}
