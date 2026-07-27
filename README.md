# HoloGrade (HTML + CSS + JS)

A lightweight Pokemon card scanner and binder manager with:

- Camera capture or image upload
- Auto condition estimate (centering, corners, edges, surface + overall grade)
- OCR-assisted card identification + Pokemon TCG API lookup
- Binder organization with customizable binder styles
- Binder-like 3x3 sleeve display
- Local persistence with `localStorage`

## Run It

Because camera APIs require a secure context, run it with a local web server.

## Option 1: VS Code Live Server

1. Open `index.html`
2. Start Live Server
3. Open the shown URL in your browser

## Option 2: Node static server

From this folder:

```bash
npx serve .
```

Then open the URL it prints.

## Notes

- Camera access may still depend on your browser/device permissions.
- If OCR cannot confidently identify the card, edit card fields manually before saving.
- Grades and PSA 9/10 values are estimates only (grade from visible image quality; PSA values are a fixed multiplier of the live raw market price) — not a substitute for professional grading or real comp data.

## Code layout

Still zero-build, plain `<script>` tags — no bundler, no framework. The app logic lives in `js/`, split by concern and loaded by `index.html` in dependency order:

- `state.js` — constants, app state, DOM element refs, core utilities
- `app-shell.js` — tabs/topbar wiring, dashboard, news feed, card detail modal
- `scan.js` — camera/upload, OCR, auto-crop, card identification
- `pricing.js` — value lookup/estimation, repricing, portfolio history
- `binder.js` — collection grid, binder book, scene panel data model, drag/drop
- `customize.js` — the Customize tab (binder/page/scene panel editor)
- `persist.js` — `localStorage` load/save, backup import/export, app bootstrap (`init()`)

## Tests

Playwright smoke tests cover the scan → analyze flow, Customize bulk panel upload, and a regression check for binders with zero cards:

```bash
npm install
npx playwright install chromium
npm test
```
