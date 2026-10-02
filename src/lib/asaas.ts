import { asaasApiUrl, getSettings } from "@/lib/settings";

// Cliente mínimo da API v3 do Asaas (https://docs.asaas.com). Chave e ambiente vêm de /admin/configuracoes.

export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  billingType: string;
  invoiceUrl: string;
  externalReference: string | null;
};

export type AsaasPixQrCode = { encodedImage: string; payload: string; expirationDate: string };

async function asaas<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const settings = await getSettings();
  const key = settings.asaasApiKey;
  if (!key) throw new Error("Pagamento online indisponível: configure a chave do Asaas no painel.");
  const base = asaasApiUrl(settings.asaasEnvironment);

  const response = await fetch(`${base}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "servo-informatica",
      access_token: key,
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.errors?.map((error: { description: string }) => error.description).join(" ");
    throw new Error(`Asaas ${response.status}: ${detail || response.statusText}`);
  }
  return data as T;
}

export async function findOrCreateCustomer(customer: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
}) {
  const found = await asaas<{ data: { id: string }[] }>(`/customers?cpfCnpj=${customer.cpfCnpj}`);
  if (found.data[0]) return found.data[0].id;
  const created = await asaas<{ id: string }>("/customers", {
    method: "POST",
    body: {
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpfCnpj,
      mobilePhone: customer.phone,
      notificationDisabled: true,
    },
  });
  return created.id;
}

export function createPayment(input: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  valueCents: number;
  description: string;
  externalReference: string;
}) {
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return asaas<AsaasPayment>("/payments", {
    method: "POST",
    body: {
      customer: input.customer,
      billingType: input.billingType,
      value: input.valueCents / 100,
      dueDate,
      description: input.description,
      externalReference: input.externalReference,
    },
  });
}

export function getPayment(id: string) {
  return asaas<AsaasPayment>(`/payments/${id}`);
}

export function getPixQrCode(paymentId: string) {
  return asaas<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

// Usado pelo botão "Testar conexão" do painel.
export async function testConnection() {
  await asaas<unknown>("/customers?limit=1");
}
