"use client";

import { useEffect, useState } from "react";

const sources = ["01", "02", "03", "04"].map((name) => ({
  video: `/banner/${name}.mp4`,
  poster: `/banner/${name}.jpg`,
}));

// Fundo tipo marca d'água da seção inteira. Os vídeos são verticais e de baixa resolução,
// por isso ficam atrás de uma película escura em vez de aparecerem nítidos.
export function HeroVideos() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const current = sources[index];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-black" aria-hidden>
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element -- fundo decorativo estático
        <img src={current.poster} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_35%] opacity-60" />
      ) : (
        <video
          key={current.video}
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[center_35%] opacity-60 blur-[2px]"
          poster={current.poster}
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={() => setIndex((value) => (value + 1) % sources.length)}
        >
          <source src={current.video} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
