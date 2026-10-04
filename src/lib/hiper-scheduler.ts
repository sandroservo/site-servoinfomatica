import { getSettings } from "@/lib/settings";
import { syncHiper } from "@/lib/hiper";

const TICK_MS = 60_000;
const scheduler = globalThis as unknown as { hiperTimer?: NodeJS.Timeout };

// A cada minuto confere em Configurações se a sincronização automática está ligada e se já deu o intervalo.
// ponytail: timer no próprio processo (o servidor roda 1 processo no pm2); com vários processos, mover para cron.
export function startHiperScheduler() {
  if (scheduler.hiperTimer) return;
  scheduler.hiperTimer = setInterval(async () => {
    try {
      const settings = await getSettings();
      if (settings.hiperAutoSync !== "1" || !settings.hiperSecurityKey) return;
      const minutes = Math.max(5, Number(settings.hiperSyncMinutes) || 15);
      const last = settings.hiperLastSyncAt ? Date.parse(settings.hiperLastSyncAt) : 0;
      if (Date.now() - last < minutes * 60_000) return;
      await syncHiper();
    } catch (error) {
      console.error("hiper: sincronização automática", error);
    }
  }, TICK_MS);
  scheduler.hiperTimer.unref?.();
}
