import { NextResponse } from "next/server";
import { getSettings, sessionSecret, verifyPassword } from "@/lib/settings";

const COOKIE = "servo_admin";

type Session = { email: string; exp: number };

function bytesToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(await sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToHex(signature);
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

export function sessionCookieName() {
  return COOKIE;
}

export async function createSessionToken(email: string) {
  const payload = btoa(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 12 }));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function readSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return null;
  try {
    const session = JSON.parse(atob(payload)) as Session;
    if (!session.email || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function credentialsMatch(email: string, password: string) {
  const { adminEmail, adminPasswordHash } = await getSettings();
  if (!adminEmail || !adminPasswordHash) return false;
  return safeEqual(email.trim().toLowerCase(), adminEmail) && (await verifyPassword(password, adminPasswordHash));
}

// Atrás do Nginx/Cloudflare, request.url aponta para localhost:3000. O domínio público vem do
// "Endereço do site" no painel; sem ele, dos headers X-Forwarded-Host/Host (ver README).
export async function publicUrl(request: Request, path: string) {
  const { siteUrl } = await getSettings();
  if (siteUrl) return new URL(path, siteUrl);
  const internal = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? internal.host;
  const proto = request.headers.get("x-forwarded-proto") ?? internal.protocol.replace(":", "");
  return new URL(path, `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`);
}

export async function redirectTo(request: Request, path: string, status = 303) {
  return NextResponse.redirect(await publicUrl(request, path), status);
}
