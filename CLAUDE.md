# CLAUDE.md — Brimm Frontend Rules

## Always Do First

Before writing any code, read:

1. brimm-skill/SKILL.md
2. output-skill/SKILL.md
3. website-data.md

Follow all three. No exceptions.

## Local Server

- Always serve on localhost — never open a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background.
- If the server is already running, do not start a second instance.

## Review Process

- Do NOT take automatic screenshots.
- Build one section at a time, completely.
- After each section is complete, stop and tell the user what was built and what comes next.
- Wait for the user to review in their browser at `http://localhost:3000` and give feedback before continuing.
- Only continue to the next section when the user says so.

## Output Defaults

- Single `index.html` file, all styles inline, unless user says otherwise.
- No Tailwind CDN — use plain CSS with CSS variables.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive.

## Brand Assets

- Always check the `brand_assets/` folder before designing.
- Use the Brimm logo from `brand_assets/` — do not use a placeholder where the real logo exists.
- All colors must come from the Brimm color system defined in brimm-skill/SKILL.md. No exceptions.

## Hard Rules

- Do not use Tailwind default colors.
- Do not use `transition-all` — always specify exactly what transitions.
- Do not use `border-radius` on buttons, cards, or major elements.
- Do not use box shadows heavier than `0 2px 8px rgba(0,0,0,0.06)`.
- Do not add sections or content not in website-data.md.
- Do not use Lorem Ipsum — use real Brimm copy from website-data.md.
- Only animate `transform` and `opacity` — nothing else.
