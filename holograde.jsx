import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  HOLOGRADE v4 — scan · grade · track · customize                    */
/*  New: Customize tab — elemental app themes, custom background       */
/*  upload, per-binder themed covers, binder rename/delete             */
/* ------------------------------------------------------------------ */

/* ---------------- themes (original elemental art, no licensed IP) -- */
const svg = (body, w = 56, h = 56) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E${body}%3C/svg%3E")`;

const THEMES = {
  holo: {
    label: "Holo Night", icon: "◆", a: "#5CE1E6", b: "#9B8CFF",
    ink: "#0C1422", panel: "#141F35", panel2: "#1B2A47", line: "#283B5E", line2: "#334973",
    bg: "radial-gradient(900px 520px at 82% -10%, #1A2A4A 0%, rgba(12,20,34,0) 60%)",
    pattern: svg("%3Cpath d='M28 8l5 8-5 8-5-8z' fill='%235CE1E6' fill-opacity='.045'/%3E%3Cpath d='M8 36l3 5-3 5-3-5z' fill='%239B8CFF' fill-opacity='.05'/%3E"),
  },
  ember: {
    label: "Ember", icon: "🔥", a: "#FFC46B", b: "#FF7A59",
    ink: "#150C09", panel: "#241410", panel2: "#2F1A13", line: "#4A281C", line2: "#5C3222",
    bg: "radial-gradient(900px 520px at 82% -10%, #3A1E14 0%, rgba(21,12,9,0) 60%)",
    pattern: svg("%3Ccircle cx='14' cy='40' r='3' fill='%23FF7A59' fill-opacity='.06'/%3E%3Ccircle cx='40' cy='14' r='2' fill='%23FFC46B' fill-opacity='.07'/%3E%3Ccircle cx='30' cy='30' r='1.4' fill='%23FFC46B' fill-opacity='.09'/%3E"),
  },
  tidal: {
    label: "Tidal", icon: "🌊", a: "#6BD5FF", b: "#5C7CFF",
    ink: "#07111F", panel: "#0F1E33", panel2: "#152943", line: "#23405F", line2: "#2E5077",
    bg: "radial-gradient(900px 520px at 82% -10%, #0E2A44 0%, rgba(7,17,31,0) 60%)",
    pattern: svg("%3Cpath d='M0 30q7-6 14 0t14 0 14 0 14 0' stroke='%236BD5FF' stroke-opacity='.06' fill='none' stroke-width='2'/%3E", 56, 56),
  },
  static: {
    label: "Static", icon: "⚡", a: "#FFE45C", b: "#FFB047",
    ink: "#12100A", panel: "#1F1C10", panel2: "#292414", line: "#453D1E", line2: "#574C25",
    bg: "radial-gradient(900px 520px at 82% -10%, #33300E 0%, rgba(18,16,10,0) 60%)",
    pattern: svg("%3Cpath d='M30 8l-8 14h6l-6 12 14-16h-7l7-10z' fill='%23FFE45C' fill-opacity='.05'/%3E"),
  },
  overgrowth: {
    label: "Overgrowth", icon: "🌿", a: "#8AE68A", b: "#3CC9A7",
    ink: "#0A140E", panel: "#122019", panel2: "#172B20", line: "#254536", line2: "#2F5743",
    bg: "radial-gradient(900px 520px at 82% -10%, #123425 0%, rgba(10,20,14,0) 60%)",
    pattern: svg("%3Cpath d='M28 12c8 4 8 14 0 20-8-6-8-16 0-20z' fill='%238AE68A' fill-opacity='.045'/%3E"),
  },
  phantom: {
    label: "Phantom", icon: "🔮", a: "#C89BFF", b: "#FF8FD8",
    ink: "#120A1C", panel: "#1E1230", panel2: "#28183F", line: "#402A60", line2: "#523677",
    bg: "radial-gradient(900px 520px at 82% -10%, #2C1640 0%, rgba(18,10,28,0) 60%)",
    pattern: svg("%3Cpath d='M28 10l3 9 9 3-9 3-3 9-3-9-9-3 9-3z' fill='%23C89BFF' fill-opacity='.05'/%3E"),
  },
};
const themeOf = (key) => THEMES[key] || THEMES.holo;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root{
  --text:#EDF2F9; --mut:#9AACC6; --gold:#F2C94C; --gold-ink:#2B2004;
  --ok:#5AD08F; --warn:#F2994A; --bad:#EB5757;
}
*{box-sizing:border-box;}
.hg-root{min-height:100vh;color:var(--text);font-family:'Inter',system-ui,sans-serif;
  padding:0 16px 72px;}
.hg-wrap{max-width:660px;margin:0 auto;}
.hg-head{display:flex;align-items:baseline;justify-content:space-between;padding:26px 2px 18px;}
.hg-logo{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:31px;
  letter-spacing:.06em;text-transform:uppercase;}
.hg-logo .holo{background:linear-gradient(100deg,var(--holo-a),var(--holo-b),var(--holo-a));
  background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;
  animation:sheen 7s linear infinite;}
@keyframes sheen{to{background-position:250% 0;}}
.hg-tag{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--mut);}
.hg-tabs{display:flex;gap:5px;background:var(--panel);border:1px solid var(--line);
  border-radius:12px;padding:5px;margin-bottom:20px;position:sticky;top:10px;z-index:5;
  box-shadow:0 8px 24px rgba(4,8,18,.45);}
.hg-tab{flex:1;border:0;border-radius:8px;padding:10px 0;cursor:pointer;background:transparent;
  color:var(--mut);font:600 12.5px 'Inter',sans-serif;letter-spacing:.03em;}
.hg-tab.on{background:var(--panel2);color:var(--text);box-shadow:inset 0 0 0 1px var(--line2);}
.hg-tab:focus-visible,.hg-btn:focus-visible,.chipbtn:focus-visible,.swatch:focus-visible,.dot:focus-visible{
  outline:2px solid var(--holo-a);outline-offset:2px;}
.hg-card{background:linear-gradient(180deg,var(--panel2) 0%,var(--panel) 100%);
  border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:14px;
  box-shadow:0 6px 20px rgba(4,8,18,.35);}
.hg-drop{border:1.5px dashed var(--line2);border-radius:14px;padding:44px 20px;text-align:center;
  cursor:pointer;background:var(--panel);}
.hg-drop:hover{border-color:var(--holo-a);}
.hg-drop h3{margin:10px 0 6px;font:600 16px 'Inter';}
.hg-drop p{margin:0;color:var(--mut);font-size:13px;line-height:1.5;}
.hg-btn{border:0;border-radius:10px;padding:12px 18px;cursor:pointer;
  font:600 14px 'Inter';letter-spacing:.02em;}
.hg-btn.primary{background:linear-gradient(100deg,var(--holo-a),var(--holo-b));color:#0A1020;}
.hg-btn.primary:hover{filter:brightness(1.08);}
.hg-btn.ghost{background:transparent;color:var(--mut);border:1px solid var(--line2);}
.hg-btn.ghost:hover{color:var(--text);}
.hg-btn.sm{padding:8px 12px;font-size:12.5px;border-radius:8px;}
.hg-btn.danger{background:transparent;border:1px solid #5A2A3A;color:#F0A9B8;}
.hg-btn:disabled{opacity:.5;cursor:default;}
.hg-preview{width:100%;max-height:380px;object-fit:contain;border-radius:10px;background:rgba(0,0,0,.4);}
.hg-note{font-size:12px;color:var(--mut);line-height:1.55;}
.hg-h{font:600 12px 'Inter';letter-spacing:.16em;text-transform:uppercase;color:var(--mut);margin:0 0 10px;}
.hg-input,.hg-select{background:rgba(0,0,0,.3);border:1px solid var(--line2);border-radius:9px;
  color:var(--text);font:500 13.5px 'Inter';padding:10px 12px;width:100%;}
.hg-input::placeholder{color:#6B7E9C;}
.hg-input:focus,.hg-select:focus{outline:none;border-color:var(--holo-a);}
/* ---- slab label (signature) ---- */
.slab{display:flex;align-items:stretch;background:linear-gradient(175deg,#FBD968 0%,var(--gold) 60%,#DBAF32 100%);
  color:var(--gold-ink);border-radius:8px;overflow:hidden;box-shadow:0 8px 26px rgba(0,0,0,.4);}
.slab-info{flex:1;padding:12px 14px;min-width:0;}
.slab-name{font-family:'Barlow Condensed';font-weight:700;font-size:22px;line-height:1.05;
  text-transform:uppercase;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.slab-sub{font-size:11.5px;font-weight:600;letter-spacing:.05em;margin-top:3px;opacity:.85;text-transform:uppercase;}
.slab-grade{width:86px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:#1C1607;color:var(--gold);}
.slab-grade b{font-family:'Barlow Condensed';font-size:34px;font-weight:700;line-height:1;}
.slab-grade span{font-size:9px;letter-spacing:.18em;margin-top:2px;}
/* ---- sub scores ---- */
.sub{display:grid;grid-template-columns:86px 1fr 34px;gap:10px;align-items:center;margin:9px 0;}
.sub label{font-size:12px;color:var(--mut);letter-spacing:.04em;}
.sub .bar{height:7px;border-radius:4px;background:rgba(0,0,0,.35);overflow:hidden;}
.sub .fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--holo-a),var(--holo-b));}
.sub b{font-size:13px;text-align:right;}
/* ---- values / stats ---- */
.vals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.val,.stat{background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:10px;padding:12px;}
.val{text-align:center;}
.val span,.stat span{display:block;font-size:10.5px;letter-spacing:.14em;color:var(--mut);text-transform:uppercase;}
.val b,.stat b{display:block;margin-top:5px;font-family:'Barlow Condensed';font-size:24px;font-weight:700;}
.stat b{font-size:22px;}
.val.max b,.stat b.holo{background:linear-gradient(100deg,var(--holo-a),var(--holo-b));
  -webkit-background-clip:text;background-clip:text;color:transparent;}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
/* ---- news ---- */
.news{padding:13px 0;border-top:1px solid var(--line);}
.news:first-of-type{border-top:0;padding-top:4px;}
.news .eyebrow{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--holo-a);font-weight:600;}
.news h4{margin:5px 0 5px;font:600 14.5px 'Inter';line-height:1.35;}
.news h4 a{color:var(--text);text-decoration:none;border-bottom:1px solid var(--line2);}
.news h4 a:hover{color:var(--holo-a);border-bottom-color:var(--holo-a);}
.news .readmore{color:var(--holo-a);text-decoration:none;font-weight:600;font-size:12.5px;white-space:nowrap;}
.news .readmore:hover{text-decoration:underline;}
.news p{margin:0;font-size:13px;color:var(--mut);line-height:1.55;}
/* ---- binder chips ---- */
.chiprow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;}
.chipbtn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line2);background:transparent;
  color:var(--mut);border-radius:999px;padding:6px 13px;font:600 12px 'Inter';cursor:pointer;letter-spacing:.03em;}
.chipbtn .cdot{width:8px;height:8px;border-radius:50%;}
.chipbtn.on{color:#0A1020;border-color:transparent;}
.chipbtn:hover{color:var(--text);}
.chipbtn.on:hover{color:#0A1020;}
/* ---- binder cover banner ---- */
.cover{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line);
  padding:22px 18px;margin-bottom:14px;box-shadow:0 8px 26px rgba(0,0,0,.4);}
.cover h2{margin:0;font-family:'Barlow Condensed';font-weight:700;font-size:30px;
  text-transform:uppercase;letter-spacing:.05em;line-height:1;}
.cover .cv-sub{margin-top:6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;font-weight:600;}
/* ---- portfolio rows ---- */
.row{display:flex;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--line);cursor:pointer;}
.row:first-of-type{border-top:0;}
.row img{width:46px;height:64px;object-fit:cover;border-radius:6px;background:rgba(0,0,0,.4);}
.row .meta{flex:1;min-width:0;}
.row .nm{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.row .st{font-size:12px;color:var(--mut);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.gchip{display:inline-block;border-radius:5px;font:700 11px 'Barlow Condensed';padding:2px 7px;letter-spacing:.05em;}
.gchip.hi{background:var(--gold);color:var(--gold-ink);}
.gchip.mid{background:linear-gradient(100deg,var(--holo-a),var(--holo-b));color:#0A1020;}
.gchip.lo{background:var(--line);color:var(--text);}
.bchip{font-size:11px;border:1px solid var(--line);border-radius:5px;padding:1px 7px;display:inline-flex;
  align-items:center;gap:5px;color:var(--mut);}
.bchip .cdot{width:6px;height:6px;border-radius:50%;}
.row .pv{text-align:right;}
.row .pv b{font-family:'Barlow Condensed';font-size:19px;}
.pl{font-size:11.5px;font-weight:600;}
.pl.up{color:var(--ok);} .pl.down{color:var(--bad);}
.expand{background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:10px;padding:14px;margin:2px 0 12px;}
.expand .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.expand label{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);margin-bottom:5px;}
/* ---- customize ---- */
.swgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.swatch{position:relative;border:1.5px solid var(--line2);border-radius:12px;height:88px;cursor:pointer;
  overflow:hidden;padding:0;background:#000;}
.swatch.on{border-color:var(--holo-a);box-shadow:0 0 0 2px var(--holo-a) inset;}
.swatch .swlabel{position:absolute;left:0;right:0;bottom:0;padding:6px 8px;font:600 11px 'Inter';
  letter-spacing:.05em;color:#EDF2F9;text-align:left;background:linear-gradient(transparent,rgba(0,0,0,.65));}
.swatch img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.swatch .swx{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;
  background:rgba(8,12,22,.75);color:#EDF2F9;font-size:11px;line-height:22px;text-align:center;
  border:1px solid rgba(255,255,255,.25);}
.swatch .swx:hover{background:#5A2A3A;}
.swatch .swadd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:26px;color:#9AACC6;padding-bottom:14px;}
.brow{display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid var(--line);}
.brow:first-of-type{border-top:0;}
.brow .bname{flex:1;min-width:0;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.brow .bmeta{font-size:11.5px;color:var(--mut);margin-top:2px;font-weight:400;}
.dots{display:flex;gap:6px;}
.dot{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;}
.dot.on{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.25);}
.icobtn{background:none;border:1px solid var(--line2);color:var(--mut);border-radius:8px;
  padding:6px 9px;cursor:pointer;font-size:13px;}
.icobtn:hover{color:var(--text);}
.spin{width:34px;height:34px;border-radius:50%;border:3px solid var(--line);
  border-top-color:var(--holo-a);animation:hgspin 1s linear infinite;margin:0 auto 14px;}
@keyframes hgspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){
  .spin{animation:none;border-top-color:var(--holo-b);}
  .hg-logo .holo{animation:none;}
}
.err{background:#2A1620;border:1px solid #5A2A3A;border-radius:10px;padding:12px 14px;
  color:#F0A9B8;font-size:13px;line-height:1.5;margin-bottom:14px;}
/* ---- live camera ---- */
.cam{position:relative;border-radius:14px;overflow:hidden;background:#000;
  border:1px solid var(--line);box-shadow:0 8px 26px rgba(0,0,0,.45);}
.cam video{display:block;width:100%;max-height:66vh;object-fit:cover;}
.cam-guide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
.cam-frame{height:78%;aspect-ratio:2.5/3.5;border:2px solid rgba(92,225,230,.9);
  border-radius:12px;box-shadow:0 0 0 2000px rgba(6,10,20,.45);}
.cam-hint{position:absolute;top:12px;left:0;right:0;text-align:center;color:#DCE7F5;
  font-size:12px;letter-spacing:.06em;text-shadow:0 1px 4px rgba(0,0,0,.8);}
.cam-bar{position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;
  justify-content:space-between;padding:14px 18px;
  background:linear-gradient(180deg,transparent,rgba(6,10,20,.75));}
.shutter{width:62px;height:62px;border-radius:50%;cursor:pointer;border:4px solid #fff;
  background:linear-gradient(135deg,var(--holo-a),var(--holo-b));box-shadow:0 4px 16px rgba(0,0,0,.5);}
.shutter:active{transform:scale(.93);}
.cam-side{width:80px;display:flex;}
.cam-side.r{justify-content:flex-end;}
.cam-mini{background:rgba(13,23,40,.75);border:1px solid var(--line2);color:var(--text);
  border-radius:9px;padding:9px 13px;font:600 12.5px 'Inter';cursor:pointer;}
.pickrow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}
@media (max-width:480px){.swgrid{grid-template-columns:repeat(2,1fr);}}
`;

const STORAGE_KEY = "portfolio-cards";
const NEWS_KEY = "news-cache";
const STYLE_KEY = "app-style";
const GRADING_FEE = 25;
const NEWS_MAX_AGE_H = 6;

const money = (n) =>
  n == null || isNaN(n) ? "—" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: Math.abs(n) < 100 ? 2 : 0 });

/* storage writes can hit transient conflicts (409) — retry once after a beat */
async function storageSet(key, value) {
  try {
    await window.storage.set(key, value);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 600));
    await window.storage.set(key, value);
  }
}

function resize(dataUrl, maxDim, quality) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => rej(new Error("Could not read that image."));
    img.src = dataUrl;
  });
}

function extractJson(data) {
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Could not read the result. Try again.");
  return JSON.parse(text.slice(start, end + 1));
}

async function callClaude(content, useSearch) {
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content }],
  };
  if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "The service returned an error.");
  return extractJson(data);
}

const SCAN_PROMPT = `You are a trading-card identification and grading assistant. Analyze the attached photo of a Pokemon card.

1. Identify the card: name, set, card number, rarity, variant (holo, reverse holo, 1st edition, etc.), and release year.
2. Assess visible condition from the photo: score centering, corners, edges, and surface each 0-10, and predict an overall professional-style grade (1-10, can be .5).
3. Estimate current market value in USD: raw (ungraded, near mint), graded PSA 9, and graded PSA 10. Use web search to check current prices if helpful. If unsure, best estimate + confidence "low".

Respond with ONLY a valid JSON object, no markdown fences, no other text:
{"identified": true, "name": "", "set": "", "number": "", "rarity": "", "variant": "", "year": "", "condition": {"centering": 0, "corners": 0, "edges": 0, "surface": 0, "predicted_grade": 0, "summary": "one sentence on visible flaws"}, "values": {"raw": 0, "psa9": 0, "psa10": 0, "confidence": "low|medium|high"}, "grading_advice": "one or two sentences: is professional grading worth it for this copy?"}

If the image is not a Pokemon card or is unreadable, respond: {"identified": false, "reason": "..."}`;

const NEWS_PROMPT = `Use web search to find 4-5 recent Pokemon Trading Card Game news items from roughly the last two weeks. Focus on: new set releases and reveals, notable market price movements, reprints or restocks, grading news, and major tournament results. Write each summary in your own words, 1-2 sentences.

Respond with ONLY a valid JSON object, no markdown fences, no other text:
{"items": [{"category": "SET RELEASE|MARKET|REPRINT|GRADING|EVENT", "title": "", "summary": "", "date": "e.g. Jul 14", "source": "publication name", "url": "direct link to the article from the search results"}]}
Only include a url if it came directly from your web search results — never guess or construct URLs. If no reliable link exists for an item, set url to null.`;

function SubScore({ label, value }) {
  const v = Math.max(0, Math.min(10, Number(value) || 0));
  return (
    <div className="sub">
      <label>{label}</label>
      <div className="bar"><div className="fill" style={{ width: v * 10 + "%" }} /></div>
      <b>{v}</b>
    </div>
  );
}

function GradeChip({ grade }) {
  if (grade == null) return null;
  const cls = grade >= 9 ? "hi" : grade >= 7 ? "mid" : "lo";
  return <span className={"gchip " + cls}>EST {grade}</span>;
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [error, setError] = useState(null);

  /* portfolio state — binders are objects: { name, theme } */
  const [cards, setCards] = useState([]);
  const [binders, setBinders] = useState([{ name: "Main Binder", theme: "holo" }]);
  const [loaded, setLoaded] = useState(false);

  /* style state — customs: up to 3 saved user images; activeCustom: index or null */
  const [appTheme, setAppTheme] = useState("holo");
  const [customs, setCustoms] = useState([]);
  const [activeCustom, setActiveCustom] = useState(null);
  const bgRef = useRef(null);
  const MAX_BGS = 3;

  /* scan state */
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [result, setResult] = useState(null);
  const [buyPrice, setBuyPrice] = useState("");
  const [addBinder, setAddBinder] = useState("Main Binder");
  const fileRef = useRef(null);
  const galleryRef = useRef(null);

  /* live camera */
  const [camOn, setCamOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* portfolio controls */
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("value");
  const [binderFilter, setBinderFilter] = useState("All");
  const [openId, setOpenId] = useState(null);

  /* news */
  const [news, setNews] = useState(null);
  const [newsAt, setNewsAt] = useState(null);
  const [newsBusy, setNewsBusy] = useState(false);

  /* ---------------- load ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          if (Array.isArray(parsed)) {
            setCards(parsed.map((c) => ({ binder: "Main Binder", purchasePrice: null, ...c })));
          } else {
            setCards(parsed.cards || []);
            let bs = parsed.binders || [];
            /* migrate string binders → objects */
            bs = bs.map((b) => (typeof b === "string" ? { name: b, theme: "holo" } : b));
            if (bs.length) setBinders(bs);
          }
        }
      } catch (e) { /* nothing saved yet */ }
      setLoaded(true);
    })();
    (async () => {
      try {
        const r = await window.storage.get(STYLE_KEY);
        if (r && r.value) {
          const s = JSON.parse(r.value);
          if (s.theme) setAppTheme(s.theme);
          if (Array.isArray(s.customs)) {
            setCustoms(s.customs);
            setActiveCustom(typeof s.activeCustom === "number" ? s.activeCustom : null);
          } else if (s.customBg) {
            /* migrate old single-image shape */
            setCustoms([s.customBg]);
            setActiveCustom(0);
          }
        }
      } catch (e) {}
    })();
    (async () => {
      try {
        const r = await window.storage.get(NEWS_KEY);
        if (r && r.value) {
          const cache = JSON.parse(r.value);
          setNews(cache.items || []);
          setNewsAt(cache.fetchedAt || null);
          if ((Date.now() - (cache.fetchedAt || 0)) / 36e5 > NEWS_MAX_AGE_H) fetchNews(true);
        } else fetchNews(true);
      } catch (e) { fetchNews(true); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = async (nextCards, nextBinders) => {
    setCards(nextCards);
    setBinders(nextBinders);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ cards: nextCards, binders: nextBinders }));
    } catch (e) {
      setError("Your portfolio could not be saved. It will still work for this session.");
    }
  };

  const persistStyle = async (theme, nextCustoms, nextActive) => {
    setAppTheme(theme);
    setCustoms(nextCustoms);
    setActiveCustom(nextActive);
    try {
      await window.storage.set(STYLE_KEY, JSON.stringify({ theme, customs: nextCustoms, activeCustom: nextActive }));
    } catch (e) {
      setError("Could not save your style. Saved images may be too large — remove one and try again.");
    }
  };

  /* ---------------- news ---------------- */
  const fetchNews = async (silent) => {
    setNewsBusy(true);
    if (!silent) setError(null);
    try {
      const r = await callClaude([{ type: "text", text: NEWS_PROMPT }], true);
      const items = r.items || [];
      setNews(items);
      const at = Date.now();
      setNewsAt(at);
      try { await window.storage.set(NEWS_KEY, JSON.stringify({ fetchedAt: at, items })); } catch (e) {}
    } catch (e) {
      if (!silent) setError("Could not load news right now. Try refresh in a moment.");
    } finally {
      setNewsBusy(false);
    }
  };

  /* ---------------- camera ---------------- */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamOn(false);
  };

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fileRef.current.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (e) {
      setError(null);
      fileRef.current.click();
    }
  };

  const capturePhoto = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const shot = c.toDataURL("image/jpeg", 0.9);
    stopCamera();
    try {
      setResult(null);
      setImage(await resize(shot, 1100, 0.85));
    } catch (e) {
      setError("Could not process that shot. Try again.");
    }
  };

  useEffect(() => {
    if (tab !== "scan") stopCamera();
    return stopCamera;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ---------------- scan ---------------- */
  const onFile = (file) => {
    if (!file) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try { setImage(await resize(reader.result, 1100, 0.85)); }
      catch (e) { setError(e.message); }
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  };

  const onBgFile = (file) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const bg = await resize(reader.result, 1300, 0.78);
        const next = [...customs, bg].slice(0, MAX_BGS);
        persistStyle(appTheme, next, next.length - 1);
      } catch (e) { setError(e.message); }
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  };

  const removeBg = (idx) => {
    const next = customs.filter((_, i) => i !== idx);
    let active = activeCustom;
    if (active === idx) active = null;
    else if (active != null && active > idx) active -= 1;
    persistStyle(appTheme, next, active);
  };

  const runAnalysis = async () => {
    if (!image) return;
    setBusy(true);
    setError(null);
    const msgs = ["Reading the card…", "Checking centering and corners…", "Looking up market prices…"];
    let i = 0;
    setBusyMsg(msgs[0]);
    const t = setInterval(() => { i = Math.min(i + 1, msgs.length - 1); setBusyMsg(msgs[i]); }, 4000);
    try {
      const base64 = image.split(",")[1];
      const r = await callClaude(
        [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
          { type: "text", text: SCAN_PROMPT },
        ],
        true
      );
      if (!r.identified) {
        setError(r.reason || "That photo does not look like a readable Pokemon card. Try a straight-on, well-lit shot.");
      } else {
        setResult(r);
        setBuyPrice("");
        setAddBinder(binders[0]?.name || "Main Binder");
      }
    } catch (e) {
      setError(e.message || "The analysis failed. Try again in a moment.");
    } finally {
      clearInterval(t);
      setBusy(false);
    }
  };

  const addToPortfolio = async () => {
    if (!result || !image) return;
    let thumb = null;
    try { thumb = await resize(image, 260, 0.7); } catch (e) {}
    const entry = {
      id: Date.now().toString(36),
      name: result.name, set: result.set, number: result.number,
      rarity: result.rarity, variant: result.variant, year: result.year,
      grade: result.condition?.predicted_grade,
      raw: result.values?.raw, psa9: result.values?.psa9, psa10: result.values?.psa10,
      purchasePrice: buyPrice === "" ? null : Number(buyPrice),
      binder: addBinder,
      thumb,
      added: new Date().toISOString().slice(0, 10),
    };
    await persist([entry, ...cards], binders);
    setTab("portfolio");
    setImage(null);
    setResult(null);
  };

  /* ---------------- binder actions ---------------- */
  const removeCard = (id) => persist(cards.filter((c) => c.id !== id), binders);
  const updateCard = (id, patch) =>
    persist(cards.map((c) => (c.id === id ? { ...c, ...patch } : c)), binders);

  const newBinder = () => {
    const name = window.prompt("Name for the new binder:");
    if (!name || !name.trim()) return;
    const n = name.trim();
    if (binders.some((b) => b.name === n)) { setBinderFilter(n); return; }
    persist(cards, [...binders, { name: n, theme: "holo" }]);
  };

  const renameBinder = (oldName) => {
    const name = window.prompt("Rename binder:", oldName);
    if (!name || !name.trim() || name.trim() === oldName) return;
    const n = name.trim();
    if (binders.some((b) => b.name === n)) { setError("A binder with that name already exists."); return; }
    persist(
      cards.map((c) => (c.binder === oldName ? { ...c, binder: n } : c)),
      binders.map((b) => (b.name === oldName ? { ...b, name: n } : b))
    );
    if (binderFilter === oldName) setBinderFilter(n);
  };

  const deleteBinder = (name) => {
    if (binders.length <= 1) return;
    const dest = binders.find((b) => b.name !== name).name;
    const count = cards.filter((c) => c.binder === name).length;
    const ok = window.confirm(
      count
        ? `Delete "${name}"? Its ${count} card${count === 1 ? "" : "s"} will move to "${dest}".`
        : `Delete "${name}"?`
    );
    if (!ok) return;
    persist(
      cards.map((c) => (c.binder === name ? { ...c, binder: dest } : c)),
      binders.filter((b) => b.name !== name)
    );
    if (binderFilter === name) setBinderFilter("All");
  };

  const setBinderTheme = (name, theme) =>
    persist(cards, binders.map((b) => (b.name === name ? { ...b, theme } : b)));

  const binderTheme = (name) => themeOf(binders.find((b) => b.name === name)?.theme);

  /* ---------------- derived ---------------- */
  const totalRaw = cards.reduce((s, c) => s + (Number(c.raw) || 0), 0);
  const invested = cards.filter((c) => c.purchasePrice != null);
  const totalPL = invested.reduce((s, c) => s + ((Number(c.raw) || 0) - Number(c.purchasePrice)), 0);
  const topCard = [...cards].sort((a, b) => (b.raw || 0) - (a.raw || 0))[0];

  const visible = cards
    .filter((c) => binderFilter === "All" || c.binder === binderFilter)
    .filter((c) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [c.name, c.set, c.number].filter(Boolean).join(" ").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "value") return (b.raw || 0) - (a.raw || 0);
      if (sortBy === "grade") return (b.grade || 0) - (a.grade || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return (b.added || "").localeCompare(a.added || "");
    });

  const upside = result
    ? (Number(result.values?.psa10) || 0) - (Number(result.values?.raw) || 0) - GRADING_FEE
    : 0;

  /* ---------------- theming ---------------- */
  const T = themeOf(appTheme);
  const activeBg = activeCustom != null ? customs[activeCustom] : null;
  const rootStyle = {
    "--holo-a": T.a, "--holo-b": T.b,
    "--ink": T.ink, "--panel": T.panel, "--panel2": T.panel2,
    "--line": T.line, "--line2": T.line2,
    backgroundColor: T.ink,
    backgroundImage: activeBg
      ? `linear-gradient(rgba(8,12,22,.82), rgba(8,12,22,.9)), url(${activeBg})`
      : `${T.pattern}, ${T.bg}`,
    backgroundRepeat: activeBg ? "no-repeat, no-repeat" : "repeat, no-repeat",
    backgroundSize: activeBg ? "cover, cover" : "auto, auto",
    backgroundAttachment: "fixed",
  };

  const filterTheme = binderFilter !== "All" ? binderTheme(binderFilter) : null;
  const binderCards = binderFilter !== "All" ? cards.filter((c) => c.binder === binderFilter) : [];
  const binderValue = binderCards.reduce((s, c) => s + (Number(c.raw) || 0), 0);

  /* ================================================================ */
  return (
    <div className="hg-root" style={rootStyle}>
      <style>{CSS}</style>
      <div className="hg-wrap">
        <div className="hg-head">
          <div className="hg-logo"><span className="holo">HOLO</span>GRADE</div>
          <div className="hg-tag">scan · grade · track</div>
        </div>

        <div className="hg-tabs" role="tablist">
          <button className={"hg-tab" + (tab === "home" ? " on" : "")} onClick={() => setTab("home")}>Home</button>
          <button className={"hg-tab" + (tab === "scan" ? " on" : "")} onClick={() => setTab("scan")}>Scan</button>
          <button className={"hg-tab" + (tab === "portfolio" ? " on" : "")} onClick={() => setTab("portfolio")}>
            Portfolio{cards.length ? ` (${cards.length})` : ""}
          </button>
          <button className={"hg-tab" + (tab === "style" ? " on" : "")} onClick={() => setTab("style")}>Customize</button>
        </div>

        {error && <div className="err">{error}</div>}

        {/* ========================= HOME ========================= */}
        {tab === "home" && (
          <>
            <div className="hg-card">
              <p className="hg-h">Collection snapshot</p>
              <div className="stats">
                <div className="stat"><span>Value (raw)</span><b className="holo">{money(totalRaw)}</b></div>
                <div className="stat"><span>Cards</span><b>{cards.length}</b></div>
                <div className="stat">
                  <span>P / L</span>
                  <b style={{ color: invested.length ? (totalPL >= 0 ? "var(--ok)" : "var(--bad)") : "var(--text)" }}>
                    {invested.length ? (totalPL >= 0 ? "+" : "−") + money(Math.abs(totalPL)).slice(1) : "—"}
                  </b>
                </div>
              </div>
              {topCard && (
                <p className="hg-note" style={{ marginTop: 12, marginBottom: 0 }}>
                  Top card: <b style={{ color: "var(--text)" }}>{topCard.name}</b> at {money(topCard.raw)} raw.
                </p>
              )}
              {!cards.length && loaded && (
                <div style={{ marginTop: 12 }}>
                  <button className="hg-btn primary sm" onClick={() => setTab("scan")}>Scan your first card</button>
                </div>
              )}
            </div>

            <div className="hg-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p className="hg-h" style={{ margin: 0 }}>TCG news</p>
                <button className="hg-btn ghost sm" onClick={() => fetchNews(false)} disabled={newsBusy}>
                  {newsBusy ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              {newsBusy && !news && (
                <div style={{ textAlign: "center", padding: "18px 0 6px" }}>
                  <div className="spin" />
                  <div className="hg-note">Checking the latest Pokemon TCG headlines…</div>
                </div>
              )}
              {news && news.length === 0 && <p className="hg-note">No headlines found right now — try refresh.</p>}
              {news && news.map((n, i) => (
                <div className="news" key={i}>
                  <div className="eyebrow">{n.category || "NEWS"}{n.date ? " · " + n.date : ""}</div>
                  <h4>
                    {n.url
                      ? <a href={n.url} target="_blank" rel="noopener noreferrer">{n.title}</a>
                      : n.title}
                  </h4>
                  <p>
                    {n.summary}
                    {n.url
                      ? <> <a className="readmore" href={n.url} target="_blank" rel="noopener noreferrer">
                          Read at {n.source || "source"} →</a></>
                      : (n.source ? " (" + n.source + ")" : "")}
                  </p>
                </div>
              ))}
              {newsAt && (
                <p className="hg-note" style={{ marginTop: 10, marginBottom: 0 }}>
                  Updated {new Date(newsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · summaries generated from web search.
                </p>
              )}
            </div>
          </>
        )}

        {/* ========================= SCAN ========================= */}
        {tab === "scan" && (
          <>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => { onFile(e.target.files[0]); e.target.value = ""; }} />
            <input ref={galleryRef} type="file" accept="image/*" hidden
              onChange={(e) => { onFile(e.target.files[0]); e.target.value = ""; }} />

            {!image && camOn && (
              <div className="cam">
                <video ref={videoRef} playsInline muted autoPlay />
                <div className="cam-guide"><div className="cam-frame" /></div>
                <div className="cam-hint">Line the card up inside the frame</div>
                <div className="cam-bar">
                  <div className="cam-side">
                    <button className="cam-mini" onClick={stopCamera}>Cancel</button>
                  </div>
                  <button className="shutter" aria-label="Take photo" onClick={capturePhoto} />
                  <div className="cam-side r">
                    <button className="cam-mini" onClick={() => { stopCamera(); galleryRef.current.click(); }}>
                      Gallery
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!image && !camOn && (
              <div className="hg-drop" role="button" tabIndex={0}
                onClick={startCamera}
                onKeyDown={(e) => e.key === "Enter" && startCamera()}>
                <div style={{ fontSize: 34 }}>📸</div>
                <h3>Scan a card</h3>
                <p>Straight-on, good light, full card in frame.<br />Front of the card works best.</p>
                <div className="pickrow" onClick={(e) => e.stopPropagation()}>
                  <button className="hg-btn primary" onClick={startCamera}>Open camera</button>
                  <button className="hg-btn ghost" onClick={() => galleryRef.current.click()}>Upload photo</button>
                </div>
              </div>
            )}

            {image && !result && (
              <div className="hg-card">
                <img className="hg-preview" src={image} alt="Card to analyze" />
                {busy ? (
                  <div style={{ textAlign: "center", padding: "22px 0 8px" }}>
                    <div className="spin" />
                    <div className="hg-note">{busyMsg}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button className="hg-btn primary" style={{ flex: 1 }} onClick={runAnalysis}>
                      Identify &amp; grade
                    </button>
                    <button className="hg-btn ghost" onClick={() => { setImage(null); setError(null); }}>
                      Retake
                    </button>
                  </div>
                )}
              </div>
            )}

            {result && (
              <>
                <div className="hg-card">
                  <div className="slab">
                    <div className="slab-info">
                      <div className="slab-name">{result.name}</div>
                      <div className="slab-sub">
                        {[result.set, result.number && "#" + result.number, result.variant || result.rarity, result.year]
                          .filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <div className="slab-grade">
                      <b>{result.condition?.predicted_grade ?? "—"}</b>
                      <span>EST. GRADE</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <SubScore label="Centering" value={result.condition?.centering} />
                    <SubScore label="Corners" value={result.condition?.corners} />
                    <SubScore label="Edges" value={result.condition?.edges} />
                    <SubScore label="Surface" value={result.condition?.surface} />
                  </div>
                  {result.condition?.summary && (
                    <p className="hg-note" style={{ marginBottom: 0 }}>{result.condition.summary}</p>
                  )}
                </div>

                <div className="hg-card">
                  <p className="hg-h">Market value (USD)</p>
                  <div className="vals">
                    <div className="val"><span>Raw</span><b>{money(result.values?.raw)}</b></div>
                    <div className="val"><span>PSA 9</span><b>{money(result.values?.psa9)}</b></div>
                    <div className="val max"><span>PSA 10</span><b>{money(result.values?.psa10)}</b></div>
                  </div>
                  <p className="hg-note" style={{ marginTop: 12, marginBottom: 0 }}>
                    PSA 10 upside after a ${GRADING_FEE} grading fee:{" "}
                    <b style={{ color: upside > 0 ? "var(--ok)" : "var(--bad)" }}>
                      {upside >= 0 ? "+" : "−"}{money(Math.abs(upside))}
                    </b>
                    {result.grading_advice ? " — " + result.grading_advice : ""}
                  </p>
                </div>

                <div className="hg-card">
                  <p className="hg-h">Add to portfolio</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div>
                      <label className="hg-note" style={{ display: "block", marginBottom: 5 }}>What you paid (optional)</label>
                      <input className="hg-input" type="number" inputMode="decimal" min="0" placeholder="$"
                        value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
                    </div>
                    <div>
                      <label className="hg-note" style={{ display: "block", marginBottom: 5 }}>Binder</label>
                      <select className="hg-select" value={addBinder} onChange={(e) => setAddBinder(e.target.value)}>
                        {binders.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="hg-btn primary" style={{ flex: 1 }} onClick={addToPortfolio}>Add card</button>
                    <button className="hg-btn ghost" onClick={() => { setImage(null); setResult(null); }}>Scan another</button>
                  </div>
                </div>
                <p className="hg-note">
                  Grades and prices are AI estimates from a single photo — check recent sold listings before buying, selling, or submitting for grading.
                </p>
              </>
            )}
          </>
        )}

        {/* ====================== PORTFOLIO ======================= */}
        {tab === "portfolio" && (
          <>
            {filterTheme ? (
              <div className="cover" style={{
                backgroundColor: filterTheme.ink,
                backgroundImage: `${filterTheme.pattern}, linear-gradient(120deg, ${filterTheme.a}33, transparent 55%), ${filterTheme.bg}`,
              }}>
                <h2 style={{ color: filterTheme.a }}>{binderFilter}</h2>
                <div className="cv-sub">
                  {binderCards.length} card{binderCards.length === 1 ? "" : "s"} · {money(binderValue)} raw
                </div>
              </div>
            ) : (
              <div className="hg-card">
                <div className="stats">
                  <div className="stat"><span>Value (raw)</span><b className="holo">{money(totalRaw)}</b></div>
                  <div className="stat"><span>Cards</span><b>{cards.length}</b></div>
                  <div className="stat">
                    <span>P / L</span>
                    <b style={{ color: invested.length ? (totalPL >= 0 ? "var(--ok)" : "var(--bad)") : "var(--text)" }}>
                      {invested.length ? (totalPL >= 0 ? "+" : "−") + money(Math.abs(totalPL)).slice(1) : "—"}
                    </b>
                  </div>
                </div>
                {invested.length > 0 && invested.length < cards.length && (
                  <p className="hg-note" style={{ marginTop: 10, marginBottom: 0 }}>
                    P/L covers the {invested.length} card{invested.length === 1 ? "" : "s"} with a purchase price. Tap a card to add one.
                  </p>
                )}
              </div>
            )}

            <div className="chiprow">
              <button className={"chipbtn" + (binderFilter === "All" ? " on" : "")}
                style={binderFilter === "All" ? { background: `linear-gradient(100deg, ${T.a}, ${T.b})` } : undefined}
                onClick={() => setBinderFilter("All")}>All</button>
              {binders.map((b) => {
                const bt = themeOf(b.theme);
                const on = binderFilter === b.name;
                return (
                  <button key={b.name} className={"chipbtn" + (on ? " on" : "")}
                    style={on ? { background: `linear-gradient(100deg, ${bt.a}, ${bt.b})` } : undefined}
                    onClick={() => setBinderFilter(b.name)}>
                    {!on && <span className="cdot" style={{ background: bt.a }} />}
                    {b.name} ({cards.filter((c) => c.binder === b.name).length})
                  </button>
                );
              })}
              <button className="chipbtn" onClick={newBinder}>＋ New binder</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 10, marginBottom: 14 }}>
              <input className="hg-input" placeholder="Search name, set, number…" value={query}
                onChange={(e) => setQuery(e.target.value)} />
              <select className="hg-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="value">Value ↓</option>
                <option value="grade">Grade ↓</option>
                <option value="name">Name A–Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div className="hg-card">
              {!loaded && <div className="hg-note">Loading your portfolio…</div>}
              {loaded && cards.length === 0 && (
                <div style={{ textAlign: "center", padding: "22px 0" }}>
                  <div style={{ fontSize: 30 }}>📇</div>
                  <p className="hg-note" style={{ marginTop: 10 }}>
                    No cards yet. Scan your first card and it will show up here with its grade and value.
                  </p>
                  <button className="hg-btn primary" style={{ marginTop: 8 }} onClick={() => setTab("scan")}>Scan a card</button>
                </div>
              )}
              {loaded && cards.length > 0 && visible.length === 0 && (
                <p className="hg-note" style={{ margin: 0 }}>No cards match. Clear the search or pick another binder.</p>
              )}

              {visible.map((c) => {
                const pl = c.purchasePrice != null ? (Number(c.raw) || 0) - Number(c.purchasePrice) : null;
                const open = openId === c.id;
                const bt = binderTheme(c.binder);
                return (
                  <div key={c.id}>
                    <div className="row" onClick={() => setOpenId(open ? null : c.id)}>
                      {c.thumb ? <img src={c.thumb} alt="" /> : <div style={{ width: 46, height: 64 }} />}
                      <div className="meta">
                        <div className="nm">{c.name}</div>
                        <div className="st">
                          <GradeChip grade={c.grade} />
                          <span className="bchip">
                            <span className="cdot" style={{ background: bt.a }} />{c.binder}
                          </span>
                          <span>{[c.set, c.number && "#" + c.number].filter(Boolean).join(" · ")}</span>
                        </div>
                      </div>
                      <div className="pv">
                        <b>{money(c.raw)}</b>
                        {pl != null
                          ? <div className={"pl " + (pl >= 0 ? "up" : "down")}>{pl >= 0 ? "+" : "−"}{money(Math.abs(pl))}</div>
                          : <div className="hg-note">PSA 10 {money(c.psa10)}</div>}
                      </div>
                    </div>

                    {open && (
                      <div className="expand" onClick={(e) => e.stopPropagation()}>
                        <div className="grid2">
                          <div>
                            <label>Binder</label>
                            <select className="hg-select" value={c.binder}
                              onChange={(e) => updateCard(c.id, { binder: e.target.value })}>
                              {binders.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label>Purchase price</label>
                            <input className="hg-input" type="number" inputMode="decimal" min="0" placeholder="$"
                              value={c.purchasePrice ?? ""}
                              onChange={(e) =>
                                updateCard(c.id, { purchasePrice: e.target.value === "" ? null : Number(e.target.value) })} />
                          </div>
                        </div>
                        <p className="hg-note" style={{ margin: "0 0 10px" }}>
                          {[c.rarity, c.variant, c.year && "released " + c.year, c.added && "added " + c.added]
                            .filter(Boolean).join(" · ")}
                          {" · PSA 9 "}{money(c.psa9)}{" · PSA 10 "}{money(c.psa10)}
                        </p>
                        <button className="hg-btn danger sm" onClick={() => { removeCard(c.id); setOpenId(null); }}>
                          Remove card
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ====================== CUSTOMIZE ======================= */}
        {tab === "style" && (
          <>
            <input ref={bgRef} type="file" accept="image/*" hidden
              onChange={(e) => { onBgFile(e.target.files[0]); e.target.value = ""; }} />

            <div className="hg-card">
              <p className="hg-h">App background</p>
              <div className="swgrid">
                {Object.entries(THEMES).map(([key, t]) => {
                  const on = activeCustom == null && appTheme === key;
                  return (
                    <button key={key} className={"swatch" + (on ? " on" : "")}
                      onClick={() => persistStyle(key, customs, null)}
                      style={{
                        backgroundColor: t.ink,
                        backgroundImage: `${t.pattern}, linear-gradient(130deg, ${t.a}40, transparent 55%), ${t.bg}`,
                      }}>
                      <span className="swlabel">{t.icon} {t.label}</span>
                    </button>
                  );
                })}
                {customs.map((bg, i) => (
                  <button key={i} className={"swatch" + (activeCustom === i ? " on" : "")}
                    onClick={() => persistStyle(appTheme, customs, i)}>
                    <img src={bg} alt={"Saved background " + (i + 1)} />
                    <span className="swlabel">🖼 My background {i + 1}</span>
                    <span className="swx" role="button" aria-label={"Remove background " + (i + 1)}
                      onClick={(e) => { e.stopPropagation(); removeBg(i); }}>✕</span>
                  </button>
                ))}
                {customs.length < MAX_BGS && (
                  <button className="swatch" onClick={() => bgRef.current.click()}
                    style={{ backgroundImage: "linear-gradient(130deg,#2A3A58,#141F35)" }}>
                    <span className="swadd">＋</span>
                    <span className="swlabel">🖼 Add your image</span>
                  </button>
                )}
              </div>
              <p className="hg-note" style={{ marginTop: 12, marginBottom: 0 }}>
                Save up to {MAX_BGS} of your own images and switch between them like themes — whichever you pick stays as your default. They sit behind a dark tint so cards stay readable. Use art you have the rights to; images stay on your device.
              </p>
            </div>

            <div className="hg-card">
              <p className="hg-h">Binder covers</p>
              {binders.map((b) => {
                const bt = themeOf(b.theme);
                return (
                  <div className="brow" key={b.name}>
                    <div className="bname">
                      {b.name}
                      <div className="bmeta">
                        {cards.filter((c) => c.binder === b.name).length} cards · {bt.label}
                      </div>
                    </div>
                    <div className="dots">
                      {Object.entries(THEMES).map(([key, t]) => (
                        <button key={key} aria-label={t.label}
                          className={"dot" + (b.theme === key ? " on" : "")}
                          style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }}
                          onClick={() => setBinderTheme(b.name, key)} />
                      ))}
                    </div>
                    <button className="icobtn" aria-label={"Rename " + b.name} onClick={() => renameBinder(b.name)}>✎</button>
                    {binders.length > 1 && (
                      <button className="icobtn" aria-label={"Delete " + b.name} onClick={() => deleteBinder(b.name)}>✕</button>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: 12 }}>
                <button className="hg-btn ghost sm" onClick={newBinder}>＋ New binder</button>
              </div>
              <p className="hg-note" style={{ marginTop: 12, marginBottom: 0 }}>
                Pick a cover that matches what's inside — Ember for fire cards, Tidal for water, Static for electric. The cover shows as a banner when you open that binder, and colors its chip in the portfolio.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
