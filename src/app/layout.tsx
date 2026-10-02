import type { Metadata } from "next";
import { Figtree, Sora } from "next/font/google";
import { storeName } from "@/lib/store";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: {
    default: `${storeName} · Notebooks`,
    template: `%s · ${storeName}`,
  },
  description:
    "Catálogo de notebooks da Servo Informática. Compare tela, peso, processador, memória e estoque da loja.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-black">{children}</body>
    </html>
  );
}
