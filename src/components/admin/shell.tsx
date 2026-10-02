"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ExternalLink, LayoutDashboard, Package, Settings, ShoppingBag, Tags, Warehouse } from "lucide-react";

const links = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Boxes },
  { href: "/admin/estoque", label: "Estoque", icon: Warehouse },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-[#111] text-white">
        <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
          <Image src="/logo-servo.png" alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
          <span>
            <span className="block font-display text-sm font-semibold">Servo</span>
            <span className="block text-[11px] uppercase tracking-[0.16em] text-white/45">Admin</span>
          </span>
        </Link>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${active ? "bg-primary text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-white/10 p-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ExternalLink className="size-4" />
            Ver a loja
          </Link>
          <p className="truncate text-xs text-white/40">{email}</p>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-sm text-white/70 hover:text-white">
              Sair
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
