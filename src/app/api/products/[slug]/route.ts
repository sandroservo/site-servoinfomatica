import { getProductBySlug, toProductJson } from "@/lib/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const product = await getProductBySlug((await context.params).slug);
  if (!product) return Response.json({ error: "Produto não encontrado" }, { status: 404 });
  return Response.json({ product: toProductJson(product) });
}
