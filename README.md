# London climate tracker

A website that tracks heat, air quality and rain/flood conditions in London, UK, and suggests local climate actions that fit today's conditions.

**Live site:** https://london-climate-tracker-flame.vercel.app/

Built as Build 2 of Terra Studio.

## What it shows

**Readings** (refreshed every 15 minutes):

| Card | What it shows | Source |
|---|---|---|
| Heat | Feels-like temperature, plus how today's expected high compares with the typical high for this time of year (1991 to 2020) | Open-Meteo |
| Air | European Air Quality Index | Open-Meteo |
| Flood warnings | Official alerts and warnings within 25 km of central London, each linking to its official page | Environment Agency |
| Rain | Total rain expected today (Dry, Light or Heavy) | Open-Meteo |
| River flow | Today's modelled river flow as a percentage of normal for this time of year | Open-Meteo |

Each card has a plain-language level and a key explaining every level. River flow is a computer-modelled estimate for the river point nearest the centre of London, not a gauge reading, and it shows how unusual the flow is, not whether anything will flood. **This site is not an official flood warning service.** For real flood alerts, use the [GOV.UK flood warning service](https://check-for-flooding.service.gov.uk/).

**Actions:** "What to do today" shows the climate actions that match today's readings first, followed by a searchable list of every action with category filters.

**How it's checked** (`/how-its-checked`): how many actions passed or were flagged, the three checks, the sources used, and each flagged action with the reason it was left out.

## How climate actions work

Actions are researched outside this project and saved as two files in `data/`:

- `verified.json`: actions that passed all checks. Only these are shown as advice.
- `flagged.json`: actions that failed a check, each with a `flag_reason`. They appear only on the "How it's checked" page.

Every action says when it applies (`when`): `any`, `heat-high`, `heat-extreme`, `cold-extreme`, `air-moderate`, `air-high`, `rain-heavy` or `flood-risk`. The site turns today's readings into those conditions and shows matching actions first.

The data format is fixed. The build checks every entry against it and **stops with a clear message if anything is missing or malformed**, so bad data can't reach visitors.

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Before publishing changes, run the same check Vercel runs:

```bash
npm run lint
npm run build
```

## Where things live

| Path | What it does |
|---|---|
| `app/page.tsx` | The home page: readings and actions tabs |
| `app/how-its-checked/page.tsx` | The "How it's checked" page |
| `app/globals.css` | Colours (including the level colours) for light and dark mode |
| `components/` | Cards, level badges and keys, tabs, and the action list with search and filters |
| `lib/city.ts` | The city's name and coordinates |
| `lib/feeds.ts` | Fetches the live feeds (server only) |
| `lib/conditions.ts` | **All the cut-off numbers**: where each level starts, and when an action counts as matching today |
| `lib/actions.ts` | Loads and checks the actions data |
| `data/` | `verified.json` and `flagged.json` |

To change where a level begins (for example, what counts as "Hot"), edit the numbers in `lib/conditions.ts`.

## Principles

- **No API keys needed.** All feeds are free and open. If a feed ever needs a key, it goes in `.env.local` (never committed) and in Vercel's environment variables.
- **Feeds run on the server only.** If one fails, only that card shows "Unavailable" and the rest of the page still works.
- **No runtime AI.** This site has no public AI or chat feature, on purpose.

## Built with

Next.js, React, TypeScript and Tailwind CSS. Deployed on Vercel.

## Data and credits

- Weather, air quality and river flow data from [Open-Meteo](https://open-meteo.com/).
- Flood alerts and warnings from the [Environment Agency](https://environment.data.gov.uk/flood-monitoring/doc/reference). Contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
- Each climate action links to the official pages it is based on.
