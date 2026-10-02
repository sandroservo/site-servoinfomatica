import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { getStore } from "@/lib/settings";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } };

export default async function CartPage() {
  return <CartView whatsapp={(await getStore()).whatsapp} />;
}
