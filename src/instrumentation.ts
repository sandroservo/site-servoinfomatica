// Roda uma vez quando o servidor Next sobe. Agenda a sincronização com o ERP Hiper.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startHiperScheduler } = await import("@/lib/hiper-scheduler");
  startHiperScheduler();
}
