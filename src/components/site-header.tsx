"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { GitCompareArrows, Headset, Menu, Phone, Search, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { instagramProfile, telHref, whatsappHref } from "@/lib/store";

type NavCategory = { name: string; slug: string };

const fixedLinks = [
  { href: "/notebooks", label: "Todos os produtos" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/lancamentos", label: "Lançamentos" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function HeaderAction({ href, icon, label, external, children }: { href: string; icon: ReactNode; label: string; external?: boolean; children?: ReactNode }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="relative flex flex-col items-center gap-1 px-2 text-[11px] text-white/80 hover:text-white"
    >
      {icon}
      <span className="hidden lg:block">{label}</span>
      {children}
    </a>
  );
}

export function SiteHeader({
  categories,
  phone,
  instagram,
  whatsapp,
}: {
  categories: NavCategory[];
  phone: string;
  instagram: string;
  whatsapp: string;
}) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const tel = telHref(phone);
  const insta = instagramProfile(instagram);
  const support = whatsappHref(whatsapp, "Olá! Vim pelo site da Servo Informática e gostaria de ajuda.") ?? tel;

  const search = (
    <form action="/buscar" role="search" className="relative w-full">
      <input
        name="q"
        type="search"
        aria-label="Buscar produtos"
        placeholder="O que você está buscando?"
        className="h-11 w-full rounded-full bg-white pl-5 pr-12 text-sm text-black outline-none ring-primary placeholder:text-neutral-500 focus:ring-2"
      />
      <button type="submit" aria-label="Buscar" className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-black hover:bg-neutral-100">
        <Search className="size-5" />
      </button>
    </form>
  );

  return (
    <header className="relative z-40 text-white lg:sticky lg:top-0">
      <div className="bg-[#2b2b2b]">
        <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-center gap-4 px-4 py-1.5 text-center text-[11px] text-white/85 sm:justify-between sm:px-6">
          <div className="hidden items-center gap-4 sm:flex">
            {tel ? (
              <a href={tel} className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="size-3.5" aria-hidden />
                {phone}
              </a>
            ) : null}
            {insta ? (
              <a href={insta.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                <InstagramIcon className="size-3.5" />
                {insta.handle}
              </a>
            ) : null}
          </div>
          <p>Parcele em até 10x no cartão | Desconto no Pix | Retirada na loja | Garantia em todos os equipamentos</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a]">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-white/10 lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image src="/emblema-servo.png" alt="" width={112} height={112} sizes="56px" priority className="size-11 sm:size-14" />
            <Image src="/logo2.png" alt="Servo Informática" width={156} height={52} priority className="h-9 w-auto sm:h-11" />
          </Link>

          <div className="mx-auto hidden max-w-2xl flex-1 md:block">{search}</div>

          <nav className="ml-auto flex items-center md:ml-0" aria-label="Atalhos">
            {support ? (
              <HeaderAction href={support} external={support.startsWith("http")} icon={<Headset className="size-6" />} label="Atendimento" />
            ) : null}
            <span className="hidden sm:block">
              <HeaderAction href="/comparar" icon={<GitCompareArrows className="size-6" />} label="Comparar" />
            </span>
            <HeaderAction href="/carrinho" icon={<ShoppingCart className="size-6" />} label="Meu carrinho">
              {count > 0 ? (
                <span className="absolute -top-1.5 right-0 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white lg:right-3">
                  {count}
                </span>
              ) : null}
            </HeaderAction>
          </nav>
        </div>
        <div className="px-4 pb-3 md:hidden">{search}</div>
      </div>

      <nav className="hidden border-t border-white/10 bg-[#111] lg:block" aria-label="Categorias">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-7 px-6 text-[13px]">
          {fixedLinks.slice(0, 1).map((link) => (
            <Link key={link.href} href={link.href} className="font-semibold hover:text-primary">
              {link.label}
            </Link>
          ))}
          {categories.slice(0, 6).map((category) => (
            <Link key={category.slug} href={`/categoria/${category.slug}`} className="text-white/85 hover:text-white">
              {category.name}
            </Link>
          ))}
          {fixedLinks.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className="font-semibold text-primary hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {open ? (
        <div className="max-h-[70vh] overflow-y-auto border-t border-white/10 bg-[#111] px-4 py-4 lg:hidden">
          <div className="grid gap-1 text-sm">
            {[...fixedLinks, ...categories.map((category) => ({ href: `/categoria/${category.slug}`, label: category.name }))].map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2.5 hover:bg-white/5" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/comparar" className="rounded-xl px-3 py-2.5 hover:bg-white/5" onClick={() => setOpen(false)}>
              Comparar notebooks
            </Link>
          </div>
          {tel || insta ? (
            <div className="mt-3 flex flex-wrap gap-4 border-t border-white/10 px-3 pt-3 text-sm text-white/80">
              {tel ? (
                <a href={tel} className="inline-flex items-center gap-1.5">
                  <Phone className="size-4" aria-hidden /> {phone}
                </a>
              ) : null}
              {insta ? (
                <a href={insta.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                  <InstagramIcon className="size-4" /> {insta.handle}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
