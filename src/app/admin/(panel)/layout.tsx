import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
