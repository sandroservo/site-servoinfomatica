export const storeName = "Servo Informática";

// Sem imports de servidor: usado também por client components.
export type StoreInfo = {
  name: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  hours: string;
};

export function whatsappHref(whatsapp: string, message: string) {
  if (!whatsapp) return null;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappHref(whatsapp: string, productName: string) {
  return whatsappHref(whatsapp, `Olá! Tenho interesse no notebook ${productName}. Poderia me ajudar?`);
}

// Aceita "@usuario", "usuario" ou a URL do perfil.
export function instagramProfile(value: string) {
  const user = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  if (!user) return null;
  return { handle: `@${user}`, href: `https://instagram.com/${user}` };
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+55${digits.replace(/^55(?=\d{10,11}$)/, "")}` : null;
}
