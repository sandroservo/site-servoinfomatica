import { NextRequest } from "next/server";
import { listProducts, parseFilters, toProductJson } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const products = await listProducts(filters);
  return Response.json({ products: products.map(toProductJson) });
}
