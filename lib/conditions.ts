import type { Action, Band, Condition, Level } from "./types";

// Rain: total expected today, in mm. "Heavy" is also what switches on the heavy-rain actions.
export const RAIN_DRY_UPTO = 0.5;
export const RAIN_HEAVY_FROM = 10;

// Change the cut-off numbers (`upTo`) here to change where each level starts.
// The same lists feed the keys shown under each panel, so the two always agree.

// Heat: "feels like" temperature in °C.
export const heatBands: Band[] = [
  {
    label: "Cool",
    tier: "cool",
    upTo: 10,
    range: "Under 10°C",
    meaning: "No heat risk. Wrap up if you are going out.",
  },
  {
    label: "Comfortable",
    tier: 1,
    upTo: 25,
    range: "10 to 24°C",
    meaning: "Pleasant for most people.",
  },
  {
    label: "Warm",
    tier: 2,
    upTo: 30,
    range: "25 to 29°C",
    meaning: "Drink water and find shade if you are outdoors for long.",
  },
  {
    label: "Hot",
    tier: 4,
    upTo: 35,
    range: "30 to 34°C",
    meaning:
      "Can strain older people, babies and anyone with health conditions. Avoid hard exercise at midday.",
  },
  {
    label: "Extreme heat",
    tier: 5,
    upTo: Infinity,
    range: "35°C and above",
    meaning:
      "Dangerous for everyone. Stay cool and check on vulnerable neighbours.",
  },
];

// Air: European Air Quality Index (lower is better).
export const airBands: Band[] = [
  {
    label: "Good",
    tier: 1,
    upTo: 20,
    range: "0 to 19",
    meaning: "Clean air. Enjoy being outdoors.",
  },
  {
    label: "Fair",
    tier: 2,
    upTo: 40,
    range: "20 to 39",
    meaning: "Fine for most people. Very sensitive people may notice it.",
  },
  {
    label: "Moderate",
    tier: 3,
    upTo: 60,
    range: "40 to 59",
    meaning:
      "People with asthma or heart or lung conditions may notice symptoms. Consider easier outdoor exercise.",
  },
  {
    label: "Poor",
    tier: 4,
    upTo: 80,
    range: "60 to 79",
    meaning:
      "Sensitive people should cut down on outdoor effort. Others may notice irritation.",
  },
  {
    label: "Very poor",
    tier: 5,
    upTo: Infinity,
    range: "80 and above",
    meaning:
      "Everyone should go easy on outdoor exercise. Sensitive people should stay indoors if they can.",
  },
];

// Rain: how much is expected today.
export const rainBands: Band[] = [
  {
    label: "Dry",
    tier: 1,
    upTo: RAIN_DRY_UPTO,
    range: `Under ${RAIN_DRY_UPTO} mm`,
    meaning: "Little or no rain expected today.",
  },
  {
    label: "Light",
    tier: 2,
    upTo: RAIN_HEAVY_FROM,
    range: `${RAIN_DRY_UPTO} to under ${RAIN_HEAVY_FROM} mm`,
    meaning: "Showery or drizzly, but an ordinary day. A coat or umbrella is enough.",
  },
  {
    label: "Heavy",
    tier: 3,
    upTo: Infinity,
    range: `${RAIN_HEAVY_FROM} mm or more`,
    meaning:
      "A properly wet day. Expect puddles and slower travel, and take care near drains and underpasses.",
  },
];

// River flow: how today's flow ranks against the same time of year in past years.
// `upTo` is the percentile: the share of past days with flow at or below today's.
// This says how unusual the flow is, not whether anything will flood.
export const riverBands: Band[] = [
  {
    label: "Normal or drier",
    tier: 1,
    upTo: 75,
    range: "Lower than 3 in 4 past days",
    meaning: "Typical for the time of year, or lower.",
  },
  {
    label: "Higher than usual",
    tier: 2,
    upTo: 95,
    range: "Higher than 3 in 4 past days",
    meaning: "Noticeably wetter than usual for the time of year.",
  },
  {
    label: "Much higher than usual",
    tier: 3,
    upTo: Infinity,
    range: "Higher than 19 in 20 past days",
    meaning:
      "Unusually high for the time of year. This alone is not a flood warning, so check the official status above.",
  },
];

// Official Environment Agency status. Not number-based, so no cut-offs.
export const warningBands: Band[] = [
  {
    label: "No warnings",
    tier: 1,
    range: "Nothing in force",
    meaning:
      "The Environment Agency has no flood alerts or warnings in force around London.",
  },
  {
    label: "Flood alert",
    tier: 3,
    range: "Level 3",
    meaning: "Flooding is possible. Be prepared.",
  },
  {
    label: "Flood warning",
    tier: 4,
    range: "Level 2",
    meaning: "Flooding is expected. Act now.",
  },
  {
    label: "Severe flood warning",
    tier: 5,
    range: "Level 1",
    meaning: "Severe flooding. Danger to life.",
  },
];

function pick(bands: Band[], value: number): Level {
  const band =
    bands.find((b) => value < (b.upTo ?? Infinity)) ?? bands[bands.length - 1];
  return { label: band.label, tier: band.tier };
}

export const heatLevel = (feelsLike: number) => pick(heatBands, feelsLike);
export const airLevel = (aqi: number) => pick(airBands, aqi);
export const rainLevel = (mm: number) => pick(rainBands, mm);
export const riverLevel = (percentile: number) => pick(riverBands, percentile);

// The most serious warning in force sets the level (1 = most serious).
export function warningLevel(worstSeverity: 1 | 2 | 3 | null): Level {
  const band =
    worstSeverity === null ? warningBands[0] : warningBands[4 - worstSeverity];
  return { label: band.label, tier: band.tier };
}

// Today's expected high compared with the typical high for this time of year.
export const COMPARISON_NORMAL_RANGE = 2; // within this many °C counts as "about normal"
export const COMPARISON_BIG_GAP = 5; // beyond this many °C counts as "much"

export function seasonalComparison(todayHigh: number, typicalHigh: number) {
  const diff = todayHigh - typicalHigh;
  const size = Math.abs(diff);
  const amount = size.toFixed(1);
  if (size <= COMPARISON_NORMAL_RANGE) {
    return { label: "About normal for the time of year", amount };
  }
  const dir = diff > 0 ? "warmer" : "cooler";
  const much = size > COMPARISON_BIG_GAP ? "Much " : "";
  const label = `${much}${much ? dir : dir[0].toUpperCase() + dir.slice(1)} than usual`;
  return { label, amount };
}

export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatLongDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ---- Which climate actions apply today ----
// Change the numbers here to change when a condition counts as active.
export const HEAT_HIGH_FROM = 30; // °C feels-like
export const HEAT_EXTREME_FROM = 35;
export const COLD_EXTREME_UPTO = 0;
export const AIR_MODERATE_FROM = 40; // European Air Quality Index
export const AIR_HIGH_FROM = 60;

export const conditionLabels: Record<Condition, string> = {
  any: "Any day",
  "heat-high": "Hot days",
  "heat-extreme": "Extreme heat",
  "cold-extreme": "Very cold days",
  "air-moderate": "Moderate air pollution",
  "air-high": "Poor air quality",
  "rain-heavy": "Heavy rain",
  "flood-risk": "Flood alerts",
};

export type TodayReadings = {
  hottestFeelsLike: number | null; // °C: the higher of now and today's expected high
  coldestFeelsLike: number | null; // °C: now
  aqi: number | null;
  rainToday: number | null; // mm
  warningCount: number | null; // official flood alerts or warnings in force
};

// Each active condition, with a short reason a visitor can read.
export function activeConditions(r: TodayReadings): Map<Condition, string> {
  const active = new Map<Condition, string>();
  const hot = r.hottestFeelsLike;
  if (hot !== null && hot >= HEAT_HIGH_FROM) {
    active.set("heat-high", `it feels like ${hot.toFixed(0)}°C today`);
  }
  if (hot !== null && hot >= HEAT_EXTREME_FROM) {
    active.set("heat-extreme", `it feels like ${hot.toFixed(0)}°C today`);
  }
  const cold = r.coldestFeelsLike;
  if (cold !== null && cold <= COLD_EXTREME_UPTO) {
    active.set("cold-extreme", `it feels like ${cold.toFixed(0)}°C right now`);
  }
  if (r.aqi !== null && r.aqi >= AIR_MODERATE_FROM) {
    active.set("air-moderate", `the air quality index is ${Math.round(r.aqi)}`);
  }
  if (r.aqi !== null && r.aqi >= AIR_HIGH_FROM) {
    active.set("air-high", `the air quality index is ${Math.round(r.aqi)}`);
  }
  if (r.rainToday !== null && r.rainToday >= RAIN_HEAVY_FROM) {
    active.set("rain-heavy", `${r.rainToday.toFixed(0)} mm of rain is expected today`);
  }
  if (r.warningCount !== null && r.warningCount > 0) {
    active.set(
      "flood-risk",
      `the Environment Agency has ${r.warningCount === 1 ? "a flood alert or warning" : "flood alerts or warnings"} in force nearby`,
    );
  }
  return active;
}

export type TodayPick = { action: Action; reasons: string[] };

const MIN_TODAY_ACTIONS = 6;

// Actions matching an active condition come first (most matches first), then
// good-any-day actions, one category at a time, until there are enough to show.
export function pickToday(
  actions: Action[],
  active: Map<Condition, string>,
): { matched: TodayPick[]; anyDay: TodayPick[] } {
  const matched = actions
    .map((action) => {
      const reasons = [
        ...new Set(
          action.when.flatMap((c) => (active.has(c) ? [active.get(c)!] : [])),
        ),
      ];
      return { action, reasons };
    })
    .filter((m) => m.reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length);

  const matchedIds = new Set(matched.map((m) => m.action.id));
  const byCategory = new Map<string, Action[]>();
  for (const a of actions) {
    if (matchedIds.has(a.id) || !a.when.includes("any")) continue;
    byCategory.set(a.category, [...(byCategory.get(a.category) ?? []), a]);
  }
  const anyDay: TodayPick[] = [];
  const need = Math.max(0, MIN_TODAY_ACTIONS - matched.length);
  const queues = [...byCategory.values()];
  for (let round = 0; anyDay.length < need && queues.some((q) => q[round]); round++) {
    for (const q of queues) {
      if (q[round] && anyDay.length < need) anyDay.push({ action: q[round], reasons: [] });
    }
  }
  return { matched, anyDay };
}
