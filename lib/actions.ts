import flaggedJson from "@/data/flagged.json";
import verifiedJson from "@/data/verified.json";
import type { Action, Condition } from "./types";

const CONDITIONS: Condition[] = [
  "any",
  "heat-high",
  "heat-extreme",
  "cold-extreme",
  "air-moderate",
  "air-high",
  "rain-heavy",
  "flood-risk",
];
const FIELDS = [
  "id",
  "city",
  "category",
  "title",
  "summary",
  "details",
  "when",
  "sources",
  "verification",
];

const isText = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

// Returns what is wrong with one entry (an empty list means it is fine).
function problemsWith(entry: unknown, status: "verified" | "flagged"): string[] {
  if (typeof entry !== "object" || entry === null) return ["not an object"];
  const e = entry as Record<string, unknown>;
  const out: string[] = [];
  for (const f of FIELDS) if (!(f in e)) out.push(`missing "${f}"`);
  for (const f of Object.keys(e)) {
    if (!FIELDS.includes(f)) out.push(`unexpected field "${f}"`);
  }
  for (const f of ["id", "city", "category", "title", "summary"]) {
    if (f in e && !isText(e[f])) out.push(`"${f}" must be text`);
  }
  if ("details" in e) {
    const d = e.details;
    if (!Array.isArray(d) || d.length === 0 || !d.every(isText)) {
      out.push(`"details" must be a list of text`);
    }
  }
  if ("when" in e) {
    const w = e.when;
    if (!Array.isArray(w) || w.length === 0) out.push(`"when" must be a list`);
    else {
      for (const c of w) {
        if (!CONDITIONS.includes(c as Condition)) out.push(`unknown "when" value ${JSON.stringify(c)}`);
      }
    }
  }
  if ("sources" in e) {
    const s = e.sources;
    if (!Array.isArray(s) || s.length === 0) out.push(`"sources" must be a list`);
    else {
      for (const src of s) {
        const ok =
          typeof src === "object" && src !== null &&
          isText((src as Record<string, unknown>).title) &&
          isText((src as Record<string, unknown>).url) &&
          /^https:\/\//.test((src as Record<string, string>).url);
        if (!ok) out.push(`a source needs a title and an https link`);
      }
    }
  }
  if ("verification" in e) {
    const v = e.verification as Record<string, unknown> | null;
    if (typeof v !== "object" || v === null) out.push(`"verification" must be an object`);
    else {
      if (v.status !== status) out.push(`verification.status should be "${status}"`);
      if (typeof v.lastChecked !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.lastChecked)) {
        out.push(`verification.lastChecked must look like 2026-10-09`);
      }
      if (!isText(v.method)) out.push(`verification.method must be text`);
      if (status === "flagged" && !isText(v.flag_reason)) out.push(`flagged entry needs a flag_reason`);
    }
  }
  return out;
}

function load(raw: unknown, file: string, status: "verified" | "flagged"): Action[] {
  if (!Array.isArray(raw)) throw new Error(`data/${file} must be a list of actions.`);
  const errors: string[] = [];
  raw.forEach((entry, i) => {
    const id = (entry as { id?: string })?.id ?? `entry ${i + 1}`;
    for (const p of problemsWith(entry, status)) errors.push(`data/${file}, ${id}: ${p}`);
  });
  if (errors.length) {
    throw new Error(`Some climate actions are not in the right format:\n${errors.join("\n")}`);
  }
  return raw as Action[];
}

const verified = load(verifiedJson, "verified.json", "verified");
const flagged = load(flaggedJson, "flagged.json", "flagged");

const ids = [...verified, ...flagged].map((a) => a.id);
const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
if (repeated.length) {
  throw new Error(`These action ids are used more than once: ${[...new Set(repeated)].join(", ")}`);
}

export const verifiedActions: Action[] = verified;
export const flaggedActions: Action[] = flagged;
