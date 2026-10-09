import Link from "next/link";
import { ActionCard } from "@/components/ActionCard";
import { ActionList } from "@/components/ActionList";
import {
  LevelBadge,
  LevelKey,
  Panel,
  Reading,
  Unavailable,
} from "@/components/Panel";
import { Tabs } from "@/components/Tabs";
import { verifiedActions } from "@/lib/actions";
import { CITY } from "@/lib/city";
import {
  COMPARISON_NORMAL_RANGE,
  activeConditions,
  airBands,
  airLevel,
  formatDate,
  formatTime,
  heatBands,
  heatLevel,
  pickToday,
  rainBands,
  rainLevel,
  riverBands,
  riverLevel,
  seasonalComparison,
  warningBands,
  warningLevel,
} from "@/lib/conditions";
import {
  WARNINGS_RADIUS,
  getAir,
  getFlood,
  getFloodWarnings,
  getWeather,
} from "@/lib/feeds";

const FLOOD_WARNINGS_URL = "https://check-for-flooding.service.gov.uk/";
// Each alert links to its own official page; the general service is the fallback.
const warningUrl = (areaId: string | null) =>
  areaId
    ? `${FLOOD_WARNINGS_URL}target-area/${areaId}`
    : FLOOD_WARNINGS_URL;

const KEY_TITLE = "What do these levels mean?";

function HeatComparison({
  todayHigh,
  typicalHigh,
}: {
  todayHigh: number;
  typicalHigh: number;
}) {
  const { label } = seasonalComparison(todayHigh, typicalHigh);
  return (
    <p className="text-xs leading-snug">
      <span className="font-semibold">{label}</span>
      <span className="hidden text-muted sm:inline">
        {" "}
        · high {todayHigh.toFixed(1)}°C vs {typicalHigh.toFixed(1)}°C typical
      </span>
    </p>
  );
}

const floodLink = (
  <p className="text-xs">
    Official:{" "}
    <a
      className="underline underline-offset-4 hover:text-accent"
      href={FLOOD_WARNINGS_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      GOV.UK flood warnings
    </a>
  </p>
);

export default async function Home() {
  const [weather, air, flood, warnings] = await Promise.all([
    getWeather(),
    getAir(),
    getFlood(),
    getFloodWarnings(),
  ]);

  const active = activeConditions({
    hottestFeelsLike: weather.ok
      ? Math.max(weather.data.feelsLike, weather.data.todayHigh ?? -Infinity)
      : null,
    coldestFeelsLike: weather.ok ? weather.data.feelsLike : null,
    aqi: air.ok ? air.data.aqi : null,
    rainToday: weather.ok ? weather.data.rainToday : null,
    warningCount: warnings.ok ? warnings.data.length : null,
  });
  const { matched, anyDay } = pickToday(verifiedActions, active);

  const worstWarning =
    warnings.ok && warnings.data.length ? warnings.data[0].severityLevel : null;

  const heatNote = weather.ok && weather.data.todayHigh !== null && weather.data.typicalHigh !== null
    ? `The line under the level compares today's expected high with the typical high for this time of year (${weather.data.typicalFrom} to ${weather.data.typicalTo}). Within ${COMPARISON_NORMAL_RANGE}°C counts as about normal. It is separate from the level, which is about how it feels for people.`
    : undefined;

  const readings = (
    <div className="flex flex-col gap-4 sm:gap-6">
      {matched.length > 0 && (
        <a
          href="#actions"
          className="hidden w-fit rounded-full bg-tint px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-line motion-reduce:transition-none [@media(min-height:760px)]:block"
        >
          {matched.length} {matched.length === 1 ? "action matches" : "actions match"}{" "}
          today&apos;s readings →
        </a>
      )}

      <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-5">
        <div className="col-span-2 lg:order-3 lg:col-span-1">
          {warnings.ok ? (
            <Panel title="Flood warnings">
              <div>
                <LevelBadge level={warningLevel(worstWarning)} />
              </div>
              {warnings.data.length > 0 && (
                <ul className="flex flex-col gap-1 text-xs">
                  {warnings.data.slice(0, 3).map((w) => (
                    <li key={`${w.description}-${w.severityLevel}`}>
                      <span className="font-semibold">{w.severity}:</span>{" "}
                      <a
                        className="underline underline-offset-4 hover:text-accent"
                        href={warningUrl(w.areaId)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {w.description}
                      </a>
                    </li>
                  ))}
                  {warnings.data.length > 3 && (
                    <li>and {warnings.data.length - 3} more</li>
                  )}
                </ul>
              )}
              {floodLink}
              <LevelKey
                title={KEY_TITLE}
                bands={warningBands}
                current={warningLevel(worstWarning).label}
                note={`Official Environment Agency alerts and warnings within ${WARNINGS_RADIUS} km of central ${CITY.name}.`}
              />
            </Panel>
          ) : (
            <Panel title="Flood warnings">
              <p className="text-xl font-light">Unavailable</p>
              <p className="text-xs text-muted">
                Official flood warnings could not be loaded.
              </p>
              {floodLink}
            </Panel>
          )}
        </div>

        <div className="lg:order-1">
          {weather.ok ? (
            <Panel title="Heat">
              <Reading
                value={weather.data.feelsLike.toFixed(1)}
                unit="°C"
                caption={`Feels like · ${formatTime(weather.data.time)} UK time`}
              />
              <div>
                <LevelBadge level={heatLevel(weather.data.feelsLike)} />
              </div>
              {weather.data.todayHigh !== null &&
                weather.data.typicalHigh !== null && (
                  <HeatComparison
                    todayHigh={weather.data.todayHigh}
                    typicalHigh={weather.data.typicalHigh}
                  />
                )}
              <LevelKey
                title={KEY_TITLE}
                bands={heatBands}
                current={heatLevel(weather.data.feelsLike).label}
                note={heatNote}
              />
            </Panel>
          ) : (
            <Unavailable title="Heat" />
          )}
        </div>

        <div className="lg:order-2">
          {air.ok ? (
            <Panel title="Air">
              <Reading
                value={String(Math.round(air.data.aqi))}
                unit="EAQI"
                caption={`Lower is better · ${formatTime(air.data.time)} UK time`}
              />
              <div>
                <LevelBadge level={airLevel(air.data.aqi)} />
              </div>
              <LevelKey
                title={KEY_TITLE}
                bands={airBands}
                current={airLevel(air.data.aqi).label}
                note="European Air Quality Index. It runs from 0 (cleanest) upwards."
              />
            </Panel>
          ) : (
            <Unavailable title="Air" />
          )}
        </div>

        <div className="lg:order-4">
          {weather.ok && weather.data.rainToday !== null ? (
            <Panel title="Rain">
              <Reading
                value={weather.data.rainToday.toFixed(1)}
                unit="mm"
                caption={`Expected today${weather.data.rainDate ? ` · ${formatDate(weather.data.rainDate)}` : ""}`}
              />
              <div>
                <LevelBadge level={rainLevel(weather.data.rainToday)} />
              </div>
              <LevelKey
                title={KEY_TITLE}
                bands={rainBands}
                current={rainLevel(weather.data.rainToday).label}
                note="Based on the total rain expected over the whole day."
              />
            </Panel>
          ) : (
            <Unavailable title="Rain" />
          )}
        </div>

        <div className="lg:order-5">
          {flood.ok ? (
            <Panel title="River flow">
              <Reading
                value={String(
                  Math.round((flood.data.discharge / flood.data.normal) * 100),
                )}
                unit="%"
                caption={`of normal · modelled ${formatDate(flood.data.date)}`}
              />
              <div>
                <LevelBadge level={riverLevel(flood.data.percentile)} />
              </div>
              <LevelKey
                title={KEY_TITLE}
                bands={riverBands}
                current={riverLevel(flood.data.percentile).label}
                note={`100% is a typical day for this time of year. Compares today's modelled river flow with the same two weeks of the year in ${flood.data.fromYear} to ${flood.data.toYear}. It shows how unusual the flow is, not whether anything will flood.`}
              />
            </Panel>
          ) : (
            <Unavailable title="River flow" />
          )}
        </div>
      </div>
    </div>
  );

  const actionsTab = (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="today-heading" className="flex flex-col gap-4">
        <h2 id="today-heading" className="text-3xl font-light tracking-tight">
          What to do today
        </h2>
        {matched.length > 0 ? (
          <p className="text-muted">These actions match today&apos;s readings.</p>
        ) : (
          <p className="text-muted">
            Nothing unusual in today&apos;s readings, so here are some good
            actions for any day.
          </p>
        )}
        <ul className="grid gap-4 md:grid-cols-2">
          {matched.map(({ action, reasons }) => (
            <ActionCard key={action.id} action={action} reasons={reasons} />
          ))}
          {anyDay.map(({ action }) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="all-heading" className="flex flex-col gap-4">
        <h2 id="all-heading" className="text-3xl font-light tracking-tight">
          All climate actions
        </h2>
        <p className="text-muted">
          Every action here passed our checks.{" "}
          <Link
            href="/how-its-checked"
            className="underline underline-offset-4 hover:text-accent"
          >
            See how it&apos;s checked
          </Link>
          .
        </p>
        <ActionList actions={verifiedActions} />
      </section>
    </div>
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-2 sm:gap-5 sm:px-8 sm:py-6">
      <header>
        <h1 className="sr-only text-2xl font-light tracking-tight sm:not-sr-only sm:text-3xl lg:text-4xl">
          {CITY.name} climate tracker
        </h1>
        <p className="mt-2 hidden max-w-xl text-base text-muted [@media(min-height:1000px)]:block">
          Live heat, air and rain readings for {CITY.name}, {CITY.country}.
        </p>
      </header>

      <Tabs readings={readings} actions={actionsTab} todayCount={matched.length} />

      <footer className="mt-auto border-t border-line pt-6 text-sm text-muted">
        <p>
          Weather, air quality and river flow data from Open-Meteo. River flow is a
          computer-modelled estimate for the river point nearest the centre of{" "}
          {CITY.name}, not a gauge reading. Flood alerts and warnings from the
          Environment Agency, contains public sector information licensed under
          the Open Government Licence v3.0.
        </p>
        <p className="mt-1">This site has no runtime AI on purpose.</p>
      </footer>
    </main>
  );
}
