"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "servo-compare";

function readSlugs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 3) : [];
  } catch {
    return [];
  }
}

export function CompareButton({ slug }: { slug: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSlugs());
  }, []);

  function toggle() {
    const current = readSlugs();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current.filter((item) => item !== slug), slug].slice(-3);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSlugs(next);
  }

  const selected = slugs.includes(slug);

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" variant={selected ? "secondary" : "ghost"} onClick={toggle}>
        {selected ? "Na comparação" : "Comparar"}
      </Button>
      {slugs.length > 0 ? (
        <Button asChild variant="outline">
          <Link href={`/comparar?itens=${slugs.join(",")}`}>Ver comparação ({slugs.length})</Link>
        </Button>
      ) : null}
    </div>
  );
}
