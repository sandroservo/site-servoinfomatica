import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { regenerateWebhookTokenAction, saveSettingsAction, testAsaasAction } from "@/app/admin/actions";
import { CopyButton } from "@/components/order-live";
import { asaasWebhookToken, getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Configurações" };

const inputClass = "mt-1 h-11 w-full rounded-2xl border border-black/10 px-3 text-sm outline-none focus:border-black";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-neutral-500">{hint}</span> : null}
    </label>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

const notices: Record<string, string> = {
  "1": "Configurações salvas.",
  token: "Novo token gerado. Atualize o webhook no painel do Asaas.",
  asaas: "Conexão com o Asaas funcionando.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  const { salvo, erro } = await searchParams;
  const [settings, webhookToken, headerList] = await Promise.all([getSettings(), asaasWebhookToken(), headers()]);
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "seu-dominio";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const webhookUrl = `${settings.siteUrl || `${protocol}://${host}`}/api/webhooks/asaas`;
  const keyHint = settings.asaasApiKey
    ? `Chave salva (termina em …${settings.asaasApiKey.slice(-4)}). Deixe em branco para manter.`
    : "Nenhuma chave salva: o checkout fica indisponível até configurar.";

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sistema</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Configurações</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-500">Tudo o que a loja precisa para funcionar, sem mexer em arquivos.</p>
      {salvo && notices[salvo] ? <p className="mt-4 text-sm text-emerald-700">{notices[salvo]}</p> : null}
      {erro ? <p role="alert" className="mt-4 text-sm text-primary">{erro}</p> : null}

      <form action={saveSettingsAction} className="mt-6 space-y-4">
        <Section title="Loja" description="Aparece no topo, no rodapé, nos botões de WhatsApp e na confirmação do pedido.">
          <div className="md:col-span-2">
            <Field label="Endereço do site" hint="Domínio público, ex.: https://servoinformatica.com.br. Usado no login, no Sair e na URL do webhook.">
              <input name="siteUrl" type="url" defaultValue={settings.siteUrl} placeholder="https://servoinformatica.com.br" className={inputClass} />
            </Field>
          </div>
          <Field label="Telefone (como exibir)">
            <input name="storePhone" defaultValue={settings.storePhone} placeholder="(00) 0000-0000" className={inputClass} />
          </Field>
          <Field label="WhatsApp" hint="Com DDI e DDD, ex.: 5511999999999. Vazio esconde os botões.">
            <input name="storeWhatsapp" inputMode="numeric" defaultValue={settings.storeWhatsapp} className={inputClass} />
          </Field>
          <Field label="E-mail de atendimento">
            <input name="storeEmail" type="email" defaultValue={settings.storeEmail} className={inputClass} />
          </Field>
          <Field label="Instagram" hint="@usuario ou link do perfil. Vazio esconde o ícone.">
            <input name="storeInstagram" defaultValue={settings.storeInstagram} placeholder="@servoinformatica" className={inputClass} />
          </Field>
          <Field label="Horário">
            <input name="storeHours" defaultValue={settings.storeHours} className={inputClass} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Endereço para retirada">
              <input name="storeAddress" defaultValue={settings.storeAddress} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Pagamentos (Asaas)" description="Chave em Asaas → Integrações → Chaves de API.">
          <Field label="Ambiente" hint="Use Sandbox para testes; Produção cobra de verdade.">
            <select name="asaasEnvironment" defaultValue={settings.asaasEnvironment} className={inputClass}>
              <option value="sandbox">Sandbox (testes)</option>
              <option value="production">Produção</option>
            </select>
          </Field>
          <Field label="Chave da API" hint={keyHint}>
            <input name="asaasApiKey" type="password" autoComplete="off" placeholder="$aact_…" className={inputClass} />
          </Field>
          <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 text-sm md:col-span-2">
            <p className="font-medium">Webhook — cadastre em Asaas → Integrações → Webhooks</p>
            <p className="text-neutral-600">
              Eventos de <strong>Cobranças</strong>, API v3. URL e token de autenticação:
            </p>
            <p className="break-all rounded-xl bg-white p-3 font-mono text-xs">{webhookUrl}</p>
            <p className="break-all rounded-xl bg-white p-3 font-mono text-xs">{webhookToken}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={webhookUrl} label="Copiar URL" />
              <CopyButton text={webhookToken} label="Copiar token" />
            </div>
            <Field label="Usar outro token" hint="Opcional. Deixe em branco para manter o atual.">
              <input name="asaasWebhookToken" autoComplete="off" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Acesso ao painel" description="Trocar a senha encerra todas as sessões e pede login de novo.">
          <Field label="E-mail do administrador">
            <input name="adminEmail" type="email" required defaultValue={settings.adminEmail} className={inputClass} />
          </Field>
          <div />
          <Field label="Nova senha" hint="Deixe em branco para manter.">
            <input name="adminPassword" type="password" minLength={8} autoComplete="new-password" className={inputClass} />
          </Field>
          <Field label="Confirmar nova senha">
            <input name="adminPasswordConfirm" type="password" autoComplete="new-password" className={inputClass} />
          </Field>
        </Section>

        <div className="sticky bottom-0 -mx-6 flex items-center gap-3 border-t border-black/5 bg-[#f4f4f4]/95 px-6 py-4 backdrop-blur lg:-mx-10 lg:px-10">
          <button type="submit" className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white">
            Salvar configurações
          </button>
          <span className="text-xs text-neutral-500">As alterações só valem depois de salvar.</span>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={testAsaasAction}>
          <button type="submit" className="h-11 rounded-full bg-black px-5 text-sm font-semibold text-white">
            Testar conexão com o Asaas
          </button>
        </form>
        <form action={regenerateWebhookTokenAction}>
          <button type="submit" className="h-11 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold">
            Gerar novo token do webhook
          </button>
        </form>
      </div>
    </div>
  );
}
