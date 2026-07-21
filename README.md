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
- Grades are heuristics from visible image quality and should be treated as estimates only.
