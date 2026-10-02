import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { storeName, type StoreInfo } from "@/lib/store";

// Tudo que antes vinha do .env. Só DATABASE_URL continua no ambiente (sem ela não há como ler esta tabela).
const defaults = {
  // Ex.: https://servoinformatica.com.br — base de redirecionamentos e da URL do webhook.
  siteUrl: "",
  storePhone: "",
  storeWhatsapp: "",
  storeEmail: "",
  storeInstagram: "",
  storeAddress: "Retirada na loja física",
  storeHours: "Seg a sex, 9h às 18h",
  asaasEnvironment: "sandbox" as "sandbox" | "production",
  // ponytail: chave em texto puro no banco; criptografar exige outra chave fora do banco.
  asaasApiKey: "",
  asaasWebhookToken: "",
  adminEmail: "",
  adminPasswordHash: "",
  sessionSecret: "",
};

export type Settings = typeof defaults;
export type SettingKey = keyof Settings;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.setting.findMany();
  const settings = { ...defaults };
  for (const row of rows) {
    if (row.key in defaults) (settings as Record<string, string>)[row.key] = row.value;
  }
  return settings;
});

export async function saveSettings(values: Partial<Settings>) {
  await prisma.$transaction(
    Object.entries(values)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, value]) =>
        prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } }),
      ),
  );
}

// Segredos gerados na primeira leitura; createMany+skipDuplicates evita corrida entre requisições.
async function ensureGenerated(key: "sessionSecret" | "asaasWebhookToken") {
  const current = (await getSettings())[key];
  if (current) return current;
  await prisma.setting.createMany({
    data: [{ key, value: randomBytes(32).toString("hex") }],
    skipDuplicates: true,
  });
  const row = await prisma.setting.findUniqueOrThrow({ where: { key } });
  return row.value;
}

export const sessionSecret = () => ensureGenerated("sessionSecret");
export const asaasWebhookToken = () => ensureGenerated("asaasWebhookToken");

export function asaasApiUrl(environment: Settings["asaasEnvironment"]) {
  return environment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
}

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Só dados públicos da loja (seguros para client components).
export async function getStore(): Promise<StoreInfo> {
  const settings = await getSettings();
  return {
    name: storeName,
    phoneDisplay: settings.storePhone,
    whatsapp: settings.storeWhatsapp.replace(/\D/g, ""),
    email: settings.storeEmail,
    instagram: settings.storeInstagram,
    address: settings.storeAddress,
    hours: settings.storeHours,
  };
}
