import "server-only";
import { CITY } from "./city";
import type {
  AirReading,
  Feed,
  FloodReading,
  FloodWarning,
  WeatherReading,
} from "./types";

const REFRESH_SECONDS = 15 * 60;

const place = {
  latitude: String(CITY.latitude),
  longitude: String(CITY.longitude),
  timezone: CITY.timezone,
};

async function getJson(
  base: string,
  params: Record<string, string>,
  revalidate = REFRESH_SECONDS,
) {
  const url = `${base}?${new URLSearchParams({ ...place, ...params })}`;
  const res = await fetch(url, {
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Feed returned ${res.status}`);
  return res.json();
}

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

// "Typical" high = the middle daily high (feels-like) within a week either side of
// today's date, across 1991 to 2020, the standard period for judging what is normal.
const NORMAL_FROM = 1991;
const NORMAL_TO = 2020;
const NORMAL_WINDOW_DAYS = 7;
const NORMAL_MIN_SAMPLES = 100;
const DAY_SECONDS = 24 * 60 * 60;

function dayOfYear(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86_400_000);
}

function median(sorted: number[]) {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function getTypicalHigh(date: string): Promise<number | null> {
  try {
    const json = await getJson(
      "https://archive-api.open-meteo.com/v1/archive",
      {
        daily: "apparent_temperature_max",
        start_date: `${NORMAL_FROM}-01-01`,
        end_date: `${NORMAL_TO}-12-31`,
      },
      DAY_SECONDS,
    );
    const times: unknown = json.daily?.time;
    const highs: unknown = json.daily?.apparent_temperature_max;
    if (!Array.isArray(times) || !Array.isArray(highs)) return null;
    const doy = dayOfYear(date);
    const samples: number[] = [];
    for (let i = 0; i < times.length; i++) {
      const v = highs[i];
      if (!isNumber(v)) continue;
      const gap = Math.abs(dayOfYear(times[i]) - doy);
      if (Math.min(gap, 365 - gap) <= NORMAL_WINDOW_DAYS) samples.push(v);
    }
    if (samples.length < NORMAL_MIN_SAMPLES) return null;
    return median(samples.sort((a, b) => a - b));
  } catch {
    return null;
  }
}

export async function getWeather(): Promise<Feed<WeatherReading>> {
  try {
    const json = await getJson("https://api.open-meteo.com/v1/forecast", {
      current: "apparent_temperature",
      daily: "precipitation_sum,apparent_temperature_max",
      forecast_days: "1",
    });
    const feelsLike = json.current?.apparent_temperature;
    const time = json.current?.time;
    if (!isNumber(feelsLike) || typeof time !== "string") return { ok: false };
    const rain = json.daily?.precipitation_sum?.[0];
    const high = json.daily?.apparent_temperature_max?.[0];
    const day = json.daily?.time?.[0];
    // If the history can't be loaded, the heat reading still works without the comparison.
    const typicalHigh =
      isNumber(high) && typeof day === "string"
        ? await getTypicalHigh(day)
        : null;
    return {
      ok: true,
      data: {
        feelsLike,
        time,
        rainToday: isNumber(rain) ? rain : null,
        rainDate: isNumber(rain) ? (day ?? null) : null,
        todayHigh: typicalHigh !== null && isNumber(high) ? high : null,
        typicalHigh,
        typicalFrom: typicalHigh !== null ? NORMAL_FROM : null,
        typicalTo: typicalHigh !== null ? NORMAL_TO : null,
      },
    };
  } catch {
    return { ok: false };
  }
}

export async function getAir(): Promise<Feed<AirReading>> {
  try {
    const json = await getJson(
      "https://air-quality-api.open-meteo.com/v1/air-quality",
      { current: "european_aqi" },
    );
    const aqi = json.current?.european_aqi;
    const time = json.current?.time;
    if (!isNumber(aqi) || typeof time !== "string") return { ok: false };
    return { ok: true, data: { aqi, time } };
  } catch {
    return { ok: false };
  }
}

// River flow history starts in 1997. "Normal" is the median flow within a week
// either side of today's date, across every earlier year.
const FLOOD_HISTORY_START = "1997-01-01";
const FLOOD_WINDOW_DAYS = 7;
const FLOOD_MIN_SAMPLES = 100;
const FLOOD_REFRESH_SECONDS = 6 * 60 * 60;

export async function getFlood(): Promise<Feed<FloodReading>> {
  try {
    // Today's reading first; its date tells us which time of year to compare with.
    const now = await getJson(
      "https://flood-api.open-meteo.com/v1/flood",
      { daily: "river_discharge", forecast_days: "1" },
      REFRESH_SECONDS,
    );
    const date = now.daily?.time?.[0];
    const discharge = now.daily?.river_discharge?.[0];
    if (typeof date !== "string" || !isNumber(discharge)) return { ok: false };

    const year = Number(date.slice(0, 4));
    const json = await getJson(
      "https://flood-api.open-meteo.com/v1/flood",
      {
        daily: "river_discharge",
        start_date: FLOOD_HISTORY_START,
        end_date: `${year - 1}-12-31`,
      },
      FLOOD_REFRESH_SECONDS,
    );
    const times: unknown = json.daily?.time;
    const flows: unknown = json.daily?.river_discharge;
    if (!Array.isArray(times) || !Array.isArray(flows)) return { ok: false };
    const doy = dayOfYear(date);

    const samples: number[] = [];
    const years = new Set<number>();
    for (let i = 0; i < times.length; i++) {
      const v = flows[i];
      const t: string = times[i];
      const y = Number(t.slice(0, 4));
      if (!isNumber(v)) continue;
      const gap = Math.abs(dayOfYear(t) - doy);
      if (Math.min(gap, 365 - gap) <= FLOOD_WINDOW_DAYS) {
        samples.push(v);
        years.add(y);
      }
    }
    if (samples.length < FLOOD_MIN_SAMPLES) return { ok: false };

    samples.sort((a, b) => a - b);
    const normal = median(samples);
    if (normal <= 0) return { ok: false };
    const atOrBelow = samples.filter((v) => v <= discharge).length;

    return {
      ok: true,
      data: {
        discharge,
        normal,
        percentile: (atOrBelow / samples.length) * 100,
        date,
        fromYear: Math.min(...years),
        toYear: Math.max(...years),
      },
    };
  } catch {
    return { ok: false };
  }
}

// Official warnings from the Environment Agency (free, no key) within this distance of the centre.
const WARNINGS_RADIUS_KM = 25;
export const WARNINGS_RADIUS = WARNINGS_RADIUS_KM;

export async function getFloodWarnings(): Promise<Feed<FloodWarning[]>> {
  try {
    const url =
      "https://environment.data.gov.uk/flood-monitoring/id/floods?" +
      new URLSearchParams({
        lat: String(CITY.latitude),
        long: String(CITY.longitude),
        dist: String(WARNINGS_RADIUS_KM),
      });
    const res = await fetch(url, {
      next: { revalidate: REFRESH_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    if (!Array.isArray(json.items)) return { ok: false };
    const warnings: FloodWarning[] = [];
    for (const item of json.items) {
      const level = item?.severityLevel;
      // 4 means "no longer in force", so it is left out.
      if ((level === 1 || level === 2 || level === 3) && typeof item.description === "string") {
        warnings.push({
          severityLevel: level,
          severity: typeof item.severity === "string" ? item.severity : "Flood alert",
          description: item.description,
          areaId:
            typeof item.floodAreaID === "string" && /^[A-Za-z0-9]+$/.test(item.floodAreaID)
              ? item.floodAreaID
              : null,
          changed:
            typeof item.timeMessageChanged === "string"
              ? item.timeMessageChanged
              : null,
        });
      }
    }
    warnings.sort(
      (a, b) =>
        a.severityLevel - b.severityLevel ||
        a.description.localeCompare(b.description),
    );
    return { ok: true, data: warnings };
  } catch {
    return { ok: false };
  }
}
