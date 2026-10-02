import { createSessionToken, credentialsMatch, publicUrl, redirectTo, sessionCookieName } from "@/lib/session";
import { getSettings, hashPassword, saveSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  // Primeiro acesso: sem administrador cadastrado, este formulário cria o acesso.
  const { adminPasswordHash } = await getSettings();
  if (!adminPasswordHash) {
    if (!email.includes("@") || password.length < 8) {
      return redirectTo(request, "/admin/login?erro=setup");
    }
    await saveSettings({ adminEmail: email, adminPasswordHash: await hashPassword(password) });
  } else if (!(await credentialsMatch(email, password))) {
    return redirectTo(request, "/admin/login?erro=1");
  }

  const response = await redirectTo(request, "/admin");
  response.cookies.set(sessionCookieName(), await createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    // Só marca Secure quando o acesso chegou por HTTPS; em HTTP puro o navegador descartaria o cookie.
    secure: (await publicUrl(request, "/")).protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
