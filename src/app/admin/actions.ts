"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  deleteProduct,
  duplicateProduct,
  requireAdmin,
  deleteBrand,
  deleteCategory,
  saveBrand,
  saveCategory,
  saveProduct,
  saveStock,
  setProductActive,
} from "@/lib/admin";
import { testConnection } from "@/lib/asaas";
import { sendOrderToHiper, syncHiper, testHiperConnection } from "@/lib/hiper";
import { hashPassword, saveSettings, type Settings } from "@/lib/settings";

function refreshCatalog() {
  revalidatePath("/", "layout");
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível salvar.";
}

export async function saveProductAction(_prev: { error?: string } | null, formData: FormData) {
  await requireAdmin();
  try {
    const id = await saveProduct(formData);
    refreshCatalog();
    redirect(`/admin/produtos/${id}?salvo=1`);
  } catch (error) {
    unstable_rethrow(error);
    return { error: message(error) };
  }
}

export async function duplicateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const copyId = await duplicateProduct(id);
  refreshCatalog();
  redirect(`/admin/produtos/${copyId}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  try {
    await deleteProduct(String(formData.get("id") ?? ""));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/produtos?erro=${encodeURIComponent(message(error))}`);
  }
  refreshCatalog();
  redirect("/admin/produtos?excluido=1");
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") !== "1";
  await setProductActive(id, active);
  refreshCatalog();
}

export async function saveBrandAction(_prev: { error?: string } | null, formData: FormData) {
  await requireAdmin();
  try {
    await saveBrand(formData);
    refreshCatalog();
  } catch (error) {
    unstable_rethrow(error);
    return { error: message(error) };
  }
  redirect("/admin/marcas?salvo=1");
}

export async function saveCategoryAction(_prev: { error?: string } | null, formData: FormData) {
  await requireAdmin();
  try {
    await saveCategory(formData);
    refreshCatalog();
  } catch (error) {
    unstable_rethrow(error);
    return { error: message(error) };
  }
  redirect("/admin/categorias?salvo=1");
}

export async function deleteBrandAction(formData: FormData) {
  await requireAdmin();
  try {
    await deleteBrand(String(formData.get("id") ?? ""));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/marcas?erro=${encodeURIComponent(message(error))}`);
  }
  refreshCatalog();
  redirect("/admin/marcas?excluido=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  try {
    await deleteCategory(String(formData.get("id") ?? ""));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/categorias?erro=${encodeURIComponent(message(error))}`);
  }
  refreshCatalog();
  redirect("/admin/categorias?excluido=1");
}

export async function saveStockAction(formData: FormData) {
  await requireAdmin();
  try {
    await saveStock(formData);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/estoque?erro=${encodeURIComponent(message(error))}`);
  }
  refreshCatalog();
  redirect("/admin/estoque?salvo=1");
}

function settingsRedirect(query: string): never {
  redirect(`/admin/configuracoes?${query}`);
}

function settingsError(text: string): never {
  settingsRedirect(`erro=${encodeURIComponent(text)}`);
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const field = (name: string) => String(formData.get(name) ?? "").trim();

  const siteUrl = field("siteUrl").replace(/\/+$/, "");
  if (siteUrl && !/^https?:\/\/[^/\s]+$/.test(siteUrl)) settingsError("Endereço do site inválido. Use algo como https://servoinformatica.com.br");

  const values: Partial<Settings> = {
    siteUrl,
    storePhone: field("storePhone"),
    storeWhatsapp: field("storeWhatsapp").replace(/\D/g, ""),
    storeEmail: field("storeEmail"),
    storeInstagram: field("storeInstagram"),
    storeAddress: field("storeAddress"),
    storeHours: field("storeHours"),
    asaasEnvironment: field("asaasEnvironment") === "production" ? "production" : "sandbox",
    hiperAutoSync: formData.get("hiperAutoSync") ? "1" : "",
    hiperSendOrders: formData.get("hiperSendOrders") ? "1" : "",
    hiperSyncMinutes: String(Math.min(1440, Math.max(5, Number(field("hiperSyncMinutes")) || 15))),
  };
  // Campos secretos em branco = manter o valor atual.
  if (field("asaasApiKey")) values.asaasApiKey = field("asaasApiKey");
  if (field("hiperSecurityKey")) values.hiperSecurityKey = field("hiperSecurityKey");
  if (field("asaasWebhookToken")) {
    if (field("asaasWebhookToken").length < 32) settingsError("O token do webhook precisa ter ao menos 32 caracteres.");
    values.asaasWebhookToken = field("asaasWebhookToken");
  }

  const email = field("adminEmail").toLowerCase();
  if (!email.includes("@")) settingsError("Informe um e-mail de administrador válido.");
  values.adminEmail = email;

  const password = String(formData.get("adminPassword") ?? "");
  if (password) {
    if (password.length < 8) settingsError("A nova senha precisa ter ao menos 8 caracteres.");
    if (password !== String(formData.get("adminPasswordConfirm") ?? "")) settingsError("As senhas não conferem.");
    values.adminPasswordHash = await hashPassword(password);
    // Novo segredo derruba todas as sessões abertas, inclusive esta.
    values.sessionSecret = randomBytes(32).toString("hex");
  }

  await saveSettings(values);
  refreshCatalog();
  if (password) redirect("/admin/login");
  settingsRedirect("salvo=1");
}

export async function regenerateWebhookTokenAction() {
  await requireAdmin();
  await saveSettings({ asaasWebhookToken: randomBytes(32).toString("hex") });
  settingsRedirect("salvo=token");
}

export async function testAsaasAction() {
  await requireAdmin();
  try {
    await testConnection();
  } catch (error) {
    settingsError(message(error));
  }
  settingsRedirect("salvo=asaas");
}

export async function testHiperAction() {
  await requireAdmin();
  try {
    await testHiperConnection();
  } catch (error) {
    settingsError(message(error));
  }
  settingsRedirect("salvo=hiper");
}

export async function syncHiperAction(formData: FormData) {
  await requireAdmin();
  let result = "";
  try {
    result = await syncHiper({ full: formData.get("full") === "1" });
  } catch (error) {
    settingsError(message(error));
  }
  refreshCatalog();
  settingsRedirect(`sync=${encodeURIComponent(result)}`);
}

export async function resendHiperOrderAction(formData: FormData) {
  await requireAdmin();
  const result = await sendOrderToHiper(String(formData.get("orderId") ?? ""));
  revalidatePath("/admin/pedidos");
  redirect(`/admin/pedidos?hiper=${result}`);
}
