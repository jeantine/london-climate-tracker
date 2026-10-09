"use client";

import { useMemo, useState } from "react";
import { ActionCard } from "@/components/ActionCard";
import type { Action } from "@/lib/types";

export function ActionList({ actions }: { actions: Action[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(actions.map((a) => a.category))],
    [actions],
  );

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return actions.filter((a) => {
      if (category && a.category !== category) return false;
      const text = [a.title, a.summary, ...a.details].join(" ").toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [actions, query, category]);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors motion-reduce:transition-none ${
      active
        ? "border-foreground bg-foreground font-medium text-background"
        : "border-line text-muted hover:border-foreground/40 hover:text-foreground"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Search actions
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="For example: heat, bus, insulation"
          className="rounded-full border border-line bg-surface px-5 py-3 text-base font-normal placeholder:text-muted/70"
        />
      </label>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          aria-pressed={category === null}
          onClick={() => setCategory(null)}
          className={chip(category === null)}
        >
          All ({actions.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(category === c ? null : c)}
            className={chip(category === c)}
          >
            {c} ({actions.filter((a) => a.category === c).length})
          </button>
        ))}
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        Showing {shown.length} of {actions.length} actions
      </p>

      {shown.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((a) => (
            <ActionCard key={a.id} action={a} />
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-8 text-center text-muted">
          No actions match. Try different words or clear the category filter.
        </p>
      )}
    </div>
  );
}
