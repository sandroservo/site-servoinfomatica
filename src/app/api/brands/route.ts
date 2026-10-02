import { listBrands } from "@/lib/catalog";

export async function GET() {
  const brands = await listBrands();
  return Response.json({
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
      productCount: brand._count.products,
    })),
  });
}
