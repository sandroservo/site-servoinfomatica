"use client";

import Image from "next/image";
import { imageUnoptimized } from "@/lib/utils";
import { useState } from "react";

export function ProductGallery({
  images,
}: {
  images: { url: string; alt: string }[];
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) return <div className="aspect-[4/3] rounded-3xl bg-neutral-100" />;

  return (
    <div>
      <div className="overflow-hidden rounded-[2rem] bg-[#f3f3f3]">
        <Image
          src={current.url}
          unoptimized={imageUnoptimized(current.url)}
          alt={current.alt}
          width={1200}
          height={900}
          priority
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-2xl border ${index === active ? "border-black" : "border-transparent"}`}
            >
              <Image src={image.url} unoptimized={imageUnoptimized(image.url)} alt="" width={160} height={120} className="h-20 w-28 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      {/* fotos de demonstração ficam em /products/; as do Hiper são reais */}
      {current?.url.startsWith("/products/") ? (
        <p className="mt-3 text-xs text-neutral-500">Foto ilustrativa até o cadastro das fotos oficiais do produto.</p>
      ) : null}
    </div>
  );
}
