"use client";

import { Children, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Rolagem nativa com snap; as setas só deslocam uma "página". Arrastar/deslizar funciona sem JS.
export function Carousel({
  children,
  itemClassName = "w-[78%] sm:w-[45%] lg:w-[calc(25%-15px)]",
  label,
}: {
  children: ReactNode;
  itemClassName?: string;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.9, behavior: "smooth" });

  const arrow =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-black/20 bg-white text-black shadow-sm transition hover:border-black hover:bg-black hover:text-white md:grid";

  return (
    <div className="relative" role="region" aria-roledescription="carrossel" aria-label={label}>
      <button type="button" aria-label="Anterior" className={`${arrow} -left-5 lg:-left-14`} onClick={() => scroll(-1)}>
        <ChevronLeft className="size-5" />
      </button>
      <div
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <div className={`shrink-0 snap-start ${itemClassName}`}>{child}</div>
        ))}
      </div>
      <button type="button" aria-label="Próximo" className={`${arrow} -right-5 lg:-right-14`} onClick={() => scroll(1)}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
