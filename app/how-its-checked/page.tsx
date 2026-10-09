import type { Metadata } from "next";
import { flaggedActions, verifiedActions } from "@/lib/actions";
import { formatLongDate } from "@/lib/conditions";

export const metadata: Metadata = {
  title: "How it's checked | London climate tracker",
  description:
    "How the climate actions on this site are checked, where they come from, and which ones were flagged.",
};

const checkExplanations: Record<string, { name: string; text: string }> = {
  schema: {
    name: "Format check",
    text: "Every action has all the parts it needs, in the right form, including a link to its source. This site checks the format again every time it is built, and will not build if something is wrong.",
  },
  spot: {
    name: "Spot check",
    text: "The action is compared with the official source page it points to. If the page can't be opened, or doesn't back up what the action says, the action is flagged and kept off the main list.",
  },
  freshness: {
    name: "Freshness check",
    text: "The action is still current: the scheme hasn't closed and the details haven't changed. Each action also shows the date it was last checked.",
  },
};

function hostOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export default function HowItsChecked() {
  const all = [...verifiedActions, ...flaggedActions];
  const dates = all.map((a) => a.verification.lastChecked).sort();
  const methods = [...new Set(all.map((a) => a.verification.method))];
  const checks = [
    ...new Set(methods.flatMap((m) => m.split("+").map((c) => c.trim()))),
  ];

  const sourcesByHost = new Map<string, Map<string, string>>();
  for (const a of verifiedActions) {
    for (const s of a.sources) {
      const host = hostOf(s.url);
      const group = sourcesByHost.get(host) ?? new Map<string, string>();
      group.set(s.url, s.title);
      sourcesByHost.set(host, group);
    }
  }
  const hosts = [...sourcesByHost.entries()].sort(
    (a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]),
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-14 px-4 py-12 sm:px-8 sm:py-20">
      <header>
        <h1 className="text-4xl font-light tracking-tight sm:text-6xl">
          How it&apos;s checked
        </h1>
        <p className="mt-4 text-lg text-muted">
          The climate actions on this site were researched outside the site and
          checked before they were added. Only actions that passed are shown on
          the main list.
        </p>
      </header>

      <section aria-labelledby="counts" className="flex flex-col gap-4">
        <h2 id="counts" className="text-2xl font-light tracking-tight">
          What passed and what didn&apos;t
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-line bg-surface p-6">
            <p className="text-5xl font-light tabular-nums">
              {verifiedActions.length}
            </p>
            <p className="mt-1 text-sm">actions passed and are shown</p>
          </div>
          <div className="rounded-3xl border border-line bg-surface p-6">
            <p className="text-5xl font-light tabular-nums">
              {flaggedActions.length}
            </p>
            <p className="mt-1 text-sm">actions were flagged and are not shown</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          {dates[0] === dates[dates.length - 1]
            ? `All checked on ${formatLongDate(dates[0])}.`
            : `Checked between ${formatLongDate(dates[0])} and ${formatLongDate(dates[dates.length - 1])}.`}
        </p>
      </section>

      <section aria-labelledby="checks" className="flex flex-col gap-4">
        <h2 id="checks" className="text-2xl font-light tracking-tight">
          The {checks.length} checks
        </h2>
        <ol className="flex flex-col gap-3">
          {checks.map((c) => {
            const info = checkExplanations[c];
            return (
              <li key={c} className="rounded-xl border border-line p-5">
                <p className="font-semibold">{info ? info.name : c}</p>
                {info && <p className="mt-1 text-sm">{info.text}</p>}
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="sources" className="flex flex-col gap-4">
        <h2 id="sources" className="text-2xl font-light tracking-tight">
          Where the actions come from
        </h2>
        <p className="text-sm text-muted">
          Every action links to the official pages it is based on. These are the
          sites used, with the number of pages from each.
        </p>
        <ul className="flex flex-col gap-3">
          {hosts.map(([host, pages]) => (
            <li key={host} className="text-sm">
              <p className="font-semibold">
                {host}{" "}
                <span className="font-normal text-muted">
                  ({pages.size} {pages.size === 1 ? "page" : "pages"})
                </span>
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {[...pages.entries()].map(([url, title]) => (
                  <li key={url}>
                    <a
                      className="underline underline-offset-4 hover:text-accent"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          The live readings on the home page come from Open-Meteo (weather, air
          quality and modelled river flow) and the Environment Agency (flood
          alerts and warnings).
        </p>
      </section>

      <section aria-labelledby="flagged" className="flex flex-col gap-4">
        <h2 id="flagged" className="text-2xl font-light tracking-tight">
          Flagged actions ({flaggedActions.length})
        </h2>
        <p className="text-sm text-muted">
          These could not be confirmed, so they are not recommended. They are
          listed here so you can see what was left out and why.
        </p>
        <ul className="flex flex-col gap-4">
          {flaggedActions.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-6 text-sm"
            >
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{a.category}</p>
              <h3 className="text-lg font-medium">{a.title}</h3>
              <p>{a.summary}</p>
              <p>
                <span className="font-semibold">Why it was flagged: </span>
                {a.verification.flag_reason}
              </p>
              <p className="text-muted">
                Source:{" "}
                {a.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ", "}
                    <a
                      className="underline underline-offset-4 hover:text-accent"
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.title}
                    </a>
                  </span>
                ))}
                . Checked {formatLongDate(a.verification.lastChecked)}.
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-auto border-t border-line pt-8 text-sm text-muted">
        This site has no runtime AI on purpose.
      </p>
    </main>
  );
}
