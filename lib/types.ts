// A feed either gives us data or it doesn't. The page never crashes on a failed feed.
export type Feed<T> = { ok: true; data: T } | { ok: false };

export type WeatherReading = {
  feelsLike: number; // °C
  time: string; // local time of the reading, e.g. "2026-10-09T16:00"
  rainToday: number | null; // mm, total for today
  rainDate: string | null; // e.g. "2026-10-09"
  todayHigh: number | null; // °C, today's expected highest feels-like temperature
  typicalHigh: number | null; // °C, typical highest feels-like for this time of year
  typicalFrom: number | null; // first and last years behind "typical"
  typicalTo: number | null;
};

export type AirReading = {
  aqi: number; // European Air Quality Index
  time: string;
};

export type FloodReading = {
  discharge: number; // m³/s, latest daily value
  normal: number; // m³/s, typical flow for this time of year (past-years median)
  percentile: number; // 0-100: share of past days at this time of year with flow at or below today's
  date: string; // the day the reading is for
  fromYear: number; // first and last years used to work out "normal"
  toYear: number;
};

// Colour group for a level. "cool" is blue; 1 (calm) to 5 (severe) run green to purple.
export type Tier = "cool" | 1 | 2 | 3 | 4 | 5;

export type Level = { label: string; tier: Tier };

// An official Environment Agency flood alert or warning.
export type FloodWarning = {
  severityLevel: 1 | 2 | 3; // 1 severe warning, 2 warning, 3 alert
  severity: string;
  description: string; // the area it covers
  areaId: string | null; // the Environment Agency code for that area, used to link to its official page
  changed: string | null;
};

// One row of a key (legend). Bands run from lowest to highest; `upTo` is the exclusive upper edge (left out for keys that are not number-based).
export type Band = {
  label: string;
  tier: Tier;
  upTo?: number;
  range: string;
  meaning: string;
};

// ---- Climate actions (the data format is fixed: do not add fields) ----

export type Condition =
  | "any"
  | "heat-high"
  | "heat-extreme"
  | "cold-extreme"
  | "air-moderate"
  | "air-high"
  | "rain-heavy"
  | "flood-risk";

export type Source = { title: string; url: string };

export type Verification = {
  status: "verified" | "flagged";
  lastChecked: string; // YYYY-MM-DD
  method: string;
  flag_reason?: string;
};

export type Action = {
  id: string;
  city: string;
  category: string;
  title: string;
  summary: string;
  details: string[];
  when: Condition[]; // the live conditions the action relates to; "any" means always
  sources: Source[];
  verification: Verification;
};
