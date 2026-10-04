"use client";

import { Children, useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = { id: string; label: string };

// Abas só escondem os painéis: todos continuam no mesmo <form>, então trocar de aba não perde o que foi digitado.
export function SettingsTabs({ tabs, initial, children }: { tabs: Tab[]; initial?: string; children: ReactNode }) {
  const [active, setActive] = useState(tabs.some((tab) => tab.id === initial) ? initial! : tabs[0].id);
  const panels = Children.toArray(children);

  function select(id: string) {
    setActive(id);
    const url = new URL(window.location.href);
    url.search = `?aba=${id}`;
    window.history.replaceState(null, "", url);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    select(next.id);
    document.getElementById(`aba-${next.id}`)?.focus();
  }

  return (
    <div>
      <input type="hidden" name="aba" value={active} />
      <div role="tablist" aria-label="Configurações" className="flex gap-1 overflow-x-auto border-b border-black/10">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`aba-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`painel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => select(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              active === tab.id ? "border-primary text-black" : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div key={tab.id} id={`painel-${tab.id}`} role="tabpanel" aria-labelledby={`aba-${tab.id}`} hidden={active !== tab.id} className="mt-6">
          {panels[index]}
        </div>
      ))}
    </div>
  );
}
