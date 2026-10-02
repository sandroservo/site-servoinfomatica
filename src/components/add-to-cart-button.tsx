"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({
  slug,
  disabled,
  label = "Adicionar ao carrinho",
}: {
  slug: string;
  disabled?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(slug);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <ShoppingBag className="size-4" />
      {added ? "Adicionado" : label}
    </Button>
  );
}
