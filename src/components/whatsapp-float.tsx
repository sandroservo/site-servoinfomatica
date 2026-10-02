import { whatsappHref } from "@/lib/store";

// Botão fixo no canto inferior direito. Some sozinho se o WhatsApp não estiver configurado no painel.
export function WhatsappFloat({ whatsapp }: { whatsapp: string }) {
  const href = whatsappHref(whatsapp, "Olá! Vim pelo site da Servo Informática e gostaria de ajuda.");
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      title="Falar no WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 fill-current">
        <path d="M16.004 3C8.826 3 3 8.826 3 16.004c0 2.294.6 4.535 1.74 6.51L3 29l6.65-1.71a12.96 12.96 0 0 0 6.35 1.64h.004C23.18 28.93 29 23.104 29 15.926 29 8.748 23.182 3 16.004 3Zm0 23.73h-.003a10.77 10.77 0 0 1-5.49-1.503l-.394-.234-3.947 1.015 1.053-3.848-.257-.395a10.72 10.72 0 0 1-1.65-5.76c0-5.94 4.834-10.774 10.69-10.774 5.9 0 10.7 4.8 10.7 10.7 0 5.938-4.8 10.8-10.702 10.8Zm5.87-8.07c-.322-.161-1.904-.94-2.199-1.047-.295-.107-.51-.161-.724.161-.215.322-.832 1.047-1.02 1.262-.188.214-.376.241-.698.08-.322-.161-1.36-.501-2.59-1.598-.957-.854-1.603-1.909-1.791-2.231-.188-.322-.02-.496.141-.656.145-.144.322-.376.483-.564.161-.188.215-.322.322-.537.107-.215.054-.403-.027-.564-.08-.161-.724-1.745-.992-2.39-.261-.627-.527-.542-.724-.552l-.617-.011a1.183 1.183 0 0 0-.859.403c-.295.322-1.127 1.101-1.127 2.686 0 1.584 1.154 3.115 1.315 3.33.161.214 2.27 3.466 5.5 4.86.769.332 1.369.53 1.837.679.772.245 1.475.21 2.03.128.619-.093 1.904-.779 2.173-1.53.268-.752.268-1.397.188-1.531-.08-.134-.295-.215-.617-.376Z" />
      </svg>
    </a>
  );
}
