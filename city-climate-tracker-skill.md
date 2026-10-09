---
name: city-climate-tracker-research
description: Research and verify local climate actions for one city, tagged to live conditions (heat, air, rain, flood), and output verified.json and flagged.json in the City Climate Tracker schema. Use when building or refreshing the Build 2 tracker for a city.
---

# City Climate Tracker research skill

You research practical local climate actions for one city and produce two JSON files the tracker site reads directly:

- `verified.json`: actions that passed all three checks. These are the only actions the site shows.
- `flagged.json`: actions that failed a check, each with a `flag_reason`. Kept for the record, shown on the site's "How it's checked" page, never as advice.

Every entry is a real program, service or step that exists today, with an official source someone can open and check. The site matches actions to live conditions, so each entry also says *when* it applies.

## Before you start

Ask the user for:

1. **City and country.** One city. If they say a region, ask them to pick the city they know best.
2. **Five to seven categories** of local action. Suggest a mix from: heat, air quality, energy at home, water and flooding, getting around, waste and reuse, trees and gardens, food. Let them add their own.
3. **Language of sources.** Official pages may be in the local language; that's fine and preferred.

Then confirm the plan in two lines and begin.

## The schema

Every entry, verified or flagged, has these fields:

```json
{
  "id": "city-slug-category-slug-number",
  "city": "City name",
  "category": "One of the user's categories",
  "title": "What someone would search for, in plain language",
  "summary": "One or two sentences: what this is and who it's for.",
  "details": ["Two to five steps, facts or specifics, each one line"],
  "when": ["any"],
  "sources": [{ "title": "Organisation: page name", "url": "https://..." }],
  "verification": {
    "status": "verified",
    "lastChecked": "YYYY-MM-DD",
    "method": "schema+spot+freshness"
  }
}
```

Flagged entries use `"status": "flagged"` and add `"flag_reason": "..."` inside `verification`.

### The `when` field

This is what makes the tracker live. Each action lists the conditions it's relevant to. Allowed values:

| Value | Meaning | Example actions |
|---|---|---|
| `any` | Applies whatever the weather | Green bin pickup, retrofit rebates, transit discount, community garden |
| `heat-high` | Feels-like 30°C and above | Cool spaces, shade and water advice, tree planting |
| `heat-extreme` | Feels-like 40°C and above | Emergency cooling centres, check-on-neighbours lines |
| `cold-extreme` | Feels-like −15°C and below | Warming centres, cold-weather utility help |
| `air-moderate` | US AQI 51–100 | Check the local air index before exercise |
| `air-high` | US AQI above 100 | Mask and stay-indoors advice, air-quality alerts |
| `rain-heavy` | 25 mm or more forecast today | Clear drains, basement prep, report flooding |
| `flood-risk` | River flow well above normal | Flood warnings page, sandbag or subsidy programs |

Rules:
- Every action gets at least one value.
- `any` means the action always applies. An action can be `any` plus a condition (for example a basement flooding subsidy is `["any", "flood-risk"]`): it's always useful and gets promoted on a flood day.
- Actions tagged only to conditions (no `any`) are shown dimmed on normal days. Use this for things that only make sense in that condition, like cool spaces.
- Aim for at least one action for each of `heat-high`, `air-high`, `rain-heavy` and `flood-risk`, if the city has something relevant. Most cities do: a heat relief page, an air quality index, a flooding or drainage page.

## How to research

**Step 1: Configure.** Record the city and categories. Note the city's official website domain, its transit agency, its utility, and the national or regional weather and air quality services. These are your primary sources.

**Step 2: Search.** For each category, look for programs on official sites first: the city, the region or province, the national government, the utility, established nonprofits. Use news articles only to discover programs, never as the source. Aim for 3 to 5 candidates per category.

**Step 3: Draft.** Write each candidate into the schema. Keep summaries plain. Put concrete numbers (prices, amounts, phone numbers) in `details`, quoted from the official page. Tag `when`.

**Step 4: Verify.** Run all three checks on every entry. Do this yourself, not by asking the user.

- **Schema check.** Every field present and the right type. `when` uses only allowed values. `sources` has at least one URL.
- **Spot check.** Open the source page. Confirm the program exists, the title matches, the details match what the page says today. If the page has different numbers, use the page's.
- **Freshness check.** Is it still running? Look for "closed", "ended", "no longer accepting", past deadlines, or a page that redirects somewhere generic. A real program that has ended is the most common failure, and it's the one that hurts users most.

An entry that passes all three goes to `verified.json` with `"status": "verified"`. Anything that fails goes to `flagged.json` with `"status": "flagged"` and a `flag_reason` that says which check failed and why, in one sentence. Never drop an entry silently.

**Step 5: Deliver.** Write both files. Then give the user a short summary: how many verified, how many flagged and why, which `when` conditions are covered, and anything you couldn't find (for example "no public cooling centre list for this city").

## Targets

- 15 to 25 verified actions across the categories. Depth matters more than breadth.
- At least one flagged entry is normal. Zero flagged usually means the freshness check wasn't done.
- Every `sources` URL loads today.

## Optional: a local live feed

The tracker's default panels (heat, air, rain and flood) work for any city with no setup. If the user wants a fourth panel, note one local feed they could add and whether it needs a key:

- A bike share system using the GBFS standard (most large cities).
- The city's open data portal (air quality stations, beach water, cooling centres).
- The national weather service's alerts API.
- Grid carbon intensity, where a public source exists (UK, Ontario, Australia, parts of Europe and the US).

List the feed URL and the key requirement in your summary. Don't build it into the JSON.

## Quality bar

- No generic advice ("use less water"). Every entry names a specific program, service or step with a source.
- No invented numbers. If the page doesn't give one, don't add one.
- No entries you couldn't open. A source you couldn't reach is a flag, not a pass.
- Write for a resident, not a policy audience. "Free bagged compost, two bags per household" beats "municipal organics diversion initiative".
