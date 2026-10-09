"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type TabId = "readings" | "actions";
const ORDER: TabId[] = ["readings", "actions"];

const fromHash = (): TabId =>
  window.location.hash === "#actions" ? "actions" : "readings";

// Two tabs that share one page. The address ends in #readings or #actions, so a tab can be linked to,
// and the back button works. Both tabs stay loaded, so switching is instant and nothing is lost.
export function Tabs({
  readings,
  actions,
  todayCount,
}: {
  readings: ReactNode;
  actions: ReactNode;
  todayCount: number;
}) {
  const [tab, setTab] = useState<TabId>("readings");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setTab(fromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // After a switch, bring the tab bar back into view so the new tab starts at its top.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const bar = listRef.current;
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView();
  }, [tab]);

  const select = useCallback((id: TabId) => {
    window.location.hash = id;
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = ORDER.indexOf(tab);
    let next: TabId | null = null;
    if (e.key === "ArrowRight") next = ORDER[(i + 1) % ORDER.length];
    if (e.key === "ArrowLeft") next = ORDER[(i + ORDER.length - 1) % ORDER.length];
    if (e.key === "Home") next = ORDER[0];
    if (e.key === "End") next = ORDER[ORDER.length - 1];
    if (next) {
      e.preventDefault();
      select(next);
      document.getElementById(`tab-${next}`)?.focus();
    }
  };

  const base =
    "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors motion-reduce:transition-none sm:px-6 sm:py-2.5 sm:text-base";
  const readingsClass =
    tab === "readings"
      ? "bg-surface text-foreground ring-1 ring-line"
      : "text-muted hover:text-foreground";
  const actionsClass =
    tab === "actions"
      ? "bg-accent text-background"
      : "font-semibold text-accent hover:bg-surface";

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Sections"
        className="flex w-fit scroll-mt-4 gap-1 rounded-full bg-tint p-1"
      >
        <button
          type="button"
          role="tab"
          id="tab-readings"
          aria-selected={tab === "readings"}
          aria-controls="panel-readings"
          tabIndex={tab === "readings" ? 0 : -1}
          onClick={() => select("readings")}
          onKeyDown={onKeyDown}
          className={`${base} ${readingsClass}`}
        >
          Readings
        </button>
        <button
          type="button"
          role="tab"
          id="tab-actions"
          aria-selected={tab === "actions"}
          aria-controls="panel-actions"
          tabIndex={tab === "actions" ? 0 : -1}
          onClick={() => select("actions")}
          onKeyDown={onKeyDown}
          className={`${base} ${actionsClass}`}
        >
          Actions
          {todayCount > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                tab === "actions"
                  ? "bg-background text-accent"
                  : "bg-accent text-background"
              }`}
            >
              {todayCount} today
            </span>
          )}
        </button>
      </div>

      <div
        role="tabpanel"
        id="panel-readings"
        aria-labelledby="tab-readings"
        hidden={tab !== "readings"}
      >
        {readings}
      </div>
      <div
        role="tabpanel"
        id="panel-actions"
        aria-labelledby="tab-actions"
        hidden={tab !== "actions"}
      >
        {actions}
      </div>
    </div>
  );
}
