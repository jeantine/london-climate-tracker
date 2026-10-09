# CLAUDE.md

## What this is

A website that tracks heat, air quality and rain/flood risk in London, UK, and suggests local climate actions. Built as Build 2 of Terra Studio.

## Stack

Next.js, TypeScript, Tailwind CSS, npm.

## Rules

- Live feeds need no API keys by default. If a feed ever needs one, keep it in `.env.local` (git-ignored) and in Vercel's environment variables. Never put keys in code or in `NEXT_PUBLIC_*` variables.
- Feeds are fetched on the server only. If a feed fails, show an "unavailable" panel instead of crashing the page.
- The site has no public AI or chat feature. The page says: "This site has no runtime AI on purpose."
- Style with Tailwind classes only. Add new colour tokens to `app/globals.css`.
- The data format for climate actions is fixed. If a feature needs a new field, flag it and stop.
- Do not research climate actions in Claude Code. They come from the City Climate Tracker skill in Cowork (`verified.json` and `flagged.json`, saved in `data/`).
- Do not run git or gh commands. Give the commands as text for the learner to run.
- Run `npm run build` before pushing, because Vercel runs the same build.

## Learning mode

- Before each step, explain briefly what you will do and why, then wait for the learner to say go.
- Use plain language and explain each technical term the first time it appears.
- Don't write code until the learner has seen and agreed to a plan. Describe plans without file names or code terms.
- After each step, name the files created or changed and ask one short question to check understanding, at most once per step.
- If the learner says "just do it", do it, and still name what changed.
- Write the learner's code fresh. Use the reference repo only for the data format, feed pattern and rules.
- The learner runs the dev server in their own terminal.
