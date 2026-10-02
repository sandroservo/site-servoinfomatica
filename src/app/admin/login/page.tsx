import Image from "next/image";
import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrar no admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const setup = !(await getSettings()).adminPasswordHash;

  return (
    <div className="grid min-h-screen place-items-center bg-[#111] px-4">
      <form action="/api/admin/login" method="post" className="w-full max-w-md rounded-[2rem] bg-white p-8">
        <Image src="/logo-servo.png" alt="Servo Informática" width={64} height={64} className="size-16 rounded-full object-cover" />
        <h1 className="mt-5 font-display text-3xl font-semibold">{setup ? "Primeiro acesso" : "Administração"}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {setup
            ? "Crie o e-mail e a senha do administrador. Depois você altera tudo em Configurações."
            : "Entre para cuidar do catálogo, dos preços e do estoque."}
        </p>
        {erro ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-sm text-primary">
            {erro === "setup" ? "Informe um e-mail válido e senha com no mínimo 8 caracteres." : "E-mail ou senha incorretos."}
          </p>
        ) : null}
        <label className="mt-6 block text-sm font-medium">
          E-mail
          <input name="email" type="email" required autoComplete="username" className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 outline-none focus:border-black" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Senha
          <input name="password" type="password" required autoComplete={setup ? "new-password" : "current-password"} minLength={setup ? 8 : undefined} className="mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 outline-none focus:border-black" />
        </label>
        <button type="submit" className="mt-6 h-11 w-full rounded-full bg-primary text-sm font-semibold text-white">
          {setup ? "Criar acesso" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
