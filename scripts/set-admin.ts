// Uso: npm run admin -- email senha [https://dominio]
// Grava o administrador (e opcionalmente o Endereço do site) direto no banco. Útil no deploy,
// antes de abrir o site, para a tela de "Primeiro acesso" nunca ficar exposta.
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { hashPassword, saveSettings } from "../src/lib/settings";

async function main() {
  const [email, password, siteUrl] = process.argv.slice(2);
  if (!email?.includes("@") || !password || password.length < 8) {
    throw new Error("Uso: npm run admin -- email senha(8+ caracteres) [https://dominio]");
  }
  await saveSettings({
    adminEmail: email.trim().toLowerCase(),
    adminPasswordHash: await hashPassword(password),
    sessionSecret: randomBytes(32).toString("hex"),
    ...(siteUrl ? { siteUrl: siteUrl.replace(/\/+$/, "") } : {}),
  });
  console.log(`Administrador ${email} gravado.${siteUrl ? ` Endereço do site: ${siteUrl}` : ""}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
