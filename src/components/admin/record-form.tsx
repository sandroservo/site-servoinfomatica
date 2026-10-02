"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";

type Action = (prev: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | null>;

export function RecordForm({
  action,
  children,
  submit = "Salvar",
}: {
  action: Action;
  children: ReactNode;
  submit?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error ? <p className="text-sm text-primary">{state.error}</p> : null}
      {children}
      <button type="submit" disabled={pending} className="h-10 rounded-full bg-black px-4 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Salvando…" : submit}
      </button>
    </form>
  );
}
