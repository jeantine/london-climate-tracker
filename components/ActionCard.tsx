import { conditionLabels, formatLongDate } from "@/lib/conditions";
import type { Action } from "@/lib/types";

export function ActionCard({
  action,
  reasons = [],
}: {
  action: Action;
  reasons?: string[];
}) {
  const conditions = action.when.filter((c) => c !== "any");
  return (
    <li className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6 transition-colors motion-reduce:transition-none hover:border-foreground/30">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-medium uppercase tracking-[0.14em] text-muted">
          {action.category}
        </span>
        {reasons.length > 0 && (
          <span className="font-semibold text-accent">
            Matches today: {reasons.join("; ")}
          </span>
        )}
      </div>
      <h3 className="text-lg font-medium leading-snug">{action.title}</h3>
      <p className="text-sm leading-relaxed text-muted">{action.summary}</p>
      <details className="group text-sm">
        <summary className="cursor-pointer list-none font-medium text-accent hover:underline [&::-webkit-details-marker]:hidden">
          Details and sources
        </summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
          {action.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="mt-4 text-muted">
          Most useful:{" "}
          {conditions.length
            ? conditions.map((c) => conditionLabels[c]).join(", ")
            : conditionLabels.any}
        </p>
        <p className="mt-4 font-medium">Sources</p>
        <ul className="mt-1 space-y-1">
          {action.sources.map((s) => (
            <li key={s.url}>
              <a
                className="underline underline-offset-4 hover:text-accent"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-muted">
          Last checked {formatLongDate(action.verification.lastChecked)}
        </p>
      </details>
    </li>
  );
}
