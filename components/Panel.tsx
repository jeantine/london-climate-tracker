import type { ReactNode } from "react";
import type { Band, Level, Tier } from "@/lib/types";

// Full class names are written out so Tailwind can find them.
const badgeClasses: Record<Tier, string> = {
  cool: "bg-tier-cool text-tier-cool-ink",
  1: "bg-tier-1 text-tier-1-ink",
  2: "bg-tier-2 text-tier-2-ink",
  3: "bg-tier-3 text-tier-3-ink",
  4: "bg-tier-4 text-tier-4-ink",
  5: "bg-tier-5 text-tier-5-ink",
};

const swatchClasses: Record<Tier, string> = {
  cool: "bg-tier-cool",
  1: "bg-tier-1",
  2: "bg-tier-2",
  3: "bg-tier-3",
  4: "bg-tier-4",
  5: "bg-tier-5",
};

// How many of the five bars fill in on a badge, so the level reads without colour.
const barsFilled: Record<Tier, number> = { cool: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

const labelClasses =
  "text-[11px] font-medium uppercase tracking-[0.16em] text-muted";

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-1 pl-3 pr-2.5 text-xs font-semibold sm:text-sm ${badgeClasses[level.tier]}`}
    >
      {level.label}
      <span aria-hidden className="flex items-end gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`w-0.5 rounded-full bg-current ${
              n <= barsFilled[level.tier] ? "opacity-100" : "opacity-30"
            }`}
            style={{ height: 4 + n * 2 }}
          />
        ))}
      </span>
    </span>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="relative flex flex-col gap-2.5 rounded-3xl border border-line bg-surface p-3 sm:p-5">
      <h2 className={`${labelClasses} pr-16`}>{title}</h2>
      {children}
    </section>
  );
}

export function Reading({
  value,
  unit,
  caption,
}: {
  value: string;
  unit: string;
  caption?: string;
}) {
  return (
    <div>
      <p className="text-3xl font-light tracking-tight tabular-nums sm:text-5xl lg:text-4xl xl:text-5xl">
        {value}
        <span className="ml-1 text-base font-normal tracking-normal text-muted">
          {unit}
        </span>
      </p>
      {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
    </div>
  );
}

export function Unavailable({ title }: { title: string }) {
  return (
    <Panel title={title}>
      <p className="text-xl font-light">Unavailable</p>
      <p className="text-xs text-muted">
        This reading could not be loaded. Try again in a few minutes.
      </p>
    </Panel>
  );
}

export function TimeNote({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-muted">{children}</p>;
}

// A key explaining every level. Closed until opened, with its toggle in the card's title row
// so it takes no height of its own. The level matching today's reading is marked.
export function LevelKey({
  title,
  bands,
  current,
  note,
  defaultOpen = false,
}: {
  title: string;
  bands: Band[];
  current: string;
  note?: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group text-sm open:border-t open:border-line open:pt-3"
    >
      <summary
        aria-label={title}
        title={title}
        className="absolute right-3 top-2.5 flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground sm:right-5 sm:top-4 [&::-webkit-details-marker]:hidden"
      >
        Levels
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="h-3 w-3 shrink-0 transition-transform motion-reduce:transition-none group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 4.5 6 8.5 10 4.5" />
        </svg>
      </summary>
      {note && <p className="text-xs leading-snug text-muted">{note}</p>}
      <ul className="mt-2 flex flex-col">
        {bands.map((band) => {
          const isNow = band.label === current;
          return (
            <li
              key={band.label}
              aria-current={isNow ? "true" : undefined}
              className={`flex gap-2.5 rounded-xl px-3 py-2 ${isNow ? "bg-tint" : ""}`}
            >
              <span
                aria-hidden
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${swatchClasses[band.tier]}`}
              />
              <span className="leading-snug">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{band.label}</span>
                  <span className="text-xs text-muted">{band.range}</span>
                  {isNow && (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                      Now
                    </span>
                  )}
                </span>
                <span className="block text-[13px]">{band.meaning}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className={`border-t border-line pt-5 ${labelClasses}`}>{children}</h3>
  );
}
