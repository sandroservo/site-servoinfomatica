import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URLs externas fora dos domínios liberados em next.config passam direto, sem o otimizador (que recusaria).
export function imageUnoptimized(url: string) {
  if (!/^https?:\/\//.test(url)) return false;
  try {
    const host = new URL(url).hostname;
    return !(host.endsWith(".amazonaws.com") || host.endsWith(".hiper.com.br"));
  } catch {
    return true;
  }
}
