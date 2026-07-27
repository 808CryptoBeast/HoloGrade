const STORAGE_KEY = "holograde-state-v1";

const PSA_ESTIMATE_TOOLTIP = "Rough estimate only: raw market price x a fixed multiplier. Not based on actual graded sale comps.";
const CONDITION_ESTIMATE_TOOLTIP = "Estimated from your photo's visible centering, corners, edges, and surface. Not a substitute for professional grading.";

const APP_THEMES = ["theme-coast", "theme-cinder", "theme-forest", "theme-plasma"];

const BINDER_STYLES = {
  ocean: ["#58d0ff", "#6effd4"],
  lava: ["#ffb36a", "#ff6f88"],
  moss: ["#83f0a2", "#56cfc7"],
  static: ["#f6e77e", "#79b6ff"],
  prism: ["#f3a5ff", "#7de3ff"],
};

const PAGE_METHOD_PRESETS = {
  classic: { label: "Classic", patternStyle: "ocean", pageTint: "#0f1d2f", sleeveColor: "#9cdfff", patternStrength: 42 },
  michi: { label: "Michi", patternStyle: "prism", pageTint: "#121a34", sleeveColor: "#6effd4", patternStrength: 68 },
  minimal: { label: "Minimal", patternStyle: "moss", pageTint: "#0f1920", sleeveColor: "#9cc8ff", patternStrength: 20 },
  energy: { label: "Energy Burst", patternStyle: "lava", pageTint: "#21131a", sleeveColor: "#ffb36a", patternStrength: 80 },
};

const CARD_SIZE_PRESETS = {
  small: { label: "Small", scale: 72, gap: 6 },
  medium: { label: "Medium", scale: 86, gap: 8 },
  showcase: { label: "Showcase", scale: 104, gap: 10 },
};

const PAGE_LAYOUT_PRESETS = {
  grid: { label: "Full Grid", panels: [] },
  topHero: {
    label: "Top Hero",
    panels: [{ anchor: 2, colSpan: 2, rowSpan: 1, title: "Hero Art" }],
  },
  middleHero: {
    label: "Middle Hero",
    panels: [{ anchor: 4, colSpan: 2, rowSpan: 1, title: "Scene Art" }],
  },
  tallStory: {
    label: "Tall Story",
    panels: [{ anchor: 3, colSpan: 1, rowSpan: 2, title: "Vertical Art" }],
  },
};

const SCENE_PANEL_TEMPLATES = {
  wide: { label: "Wide Panel", colSpan: 2, rowSpan: 1, anchor: 2, title: "Scene Art" },
  tall: { label: "Tall Panel", colSpan: 1, rowSpan: 2, anchor: 3, title: "Vertical Art" },
  square: { label: "Square Panel", colSpan: 1, rowSpan: 1, anchor: 5, title: "Detail Art" },
};

const STICKER_PRESETS = {
  star: { label: "Star", fill: "#ffe27a", stroke: "#fff6c1", path: "M50 8 L61 36 L91 36 L67 54 L76 84 L50 67 L24 84 L33 54 L9 36 L39 36 Z" },
  spark: { label: "Spark", fill: "#8de9ff", stroke: "#d8fbff", path: "M50 4 L58 34 L88 42 L58 50 L50 96 L42 50 L12 42 L42 34 Z" },
  heart: { label: "Heart", fill: "#ff9db0", stroke: "#ffd7df", path: "M50 86 C18 62 10 44 10 28 C10 16 19 8 31 8 C40 8 47 13 50 20 C53 13 60 8 69 8 C81 8 90 16 90 28 C90 44 82 62 50 86 Z" },
  bolt: { label: "Bolt", fill: "#ffd36d", stroke: "#fff1bf", path: "M58 6 L28 50 H46 L36 94 L72 42 H53 Z" },
  bloom: { label: "Bloom", fill: "#c9a8ff", stroke: "#f1e7ff", path: "M50 18 C59 2 76 6 76 22 C92 14 101 28 90 40 C106 44 106 62 90 66 C101 78 92 92 76 84 C76 100 59 104 50 88 C41 104 24 100 24 84 C8 92 -1 78 10 66 C-6 62 -6 44 10 40 C-1 28 8 14 24 22 C24 6 41 2 50 18 Z" },
  ribbon: { label: "Ribbon", fill: "#7dffd4", stroke: "#e0fff5", path: "M18 30 C30 14 70 14 82 30 C88 38 88 50 82 58 C74 68 63 71 55 78 L62 94 L50 88 L38 94 L45 78 C37 71 26 68 18 58 C12 50 12 38 18 30 Z" },
};

const CURATED_NEWS_ITEMS = [
  {
    title: "Pokemon TCG Hub",
    link: "https://www.pokemon.com/us/pokemon-tcg",
    source: "Pokemon",
    summary: "Official Pokemon TCG landing page for product updates, expansions, and play resources.",
    image: "https://images.pokemontcg.io/sv1/symbol.png",
  },
  {
    title: "Pokemon News",
    link: "https://www.pokemon.com/us/pokemon-news",
    source: "Pokemon News",
    summary: "Official Pokemon news stream covering TCG announcements, events, and product releases.",
    image: "https://images.pokemontcg.io/sv3pt5/logo.png",
  },
  {
    title: "Play Pokemon Events",
    link: "https://www.pokemon.com/us/play-pokemon",
    source: "Play Pokemon",
    summary: "Tournament, league, and organized-play information relevant to active TCG collectors and players.",
    image: "https://images.pokemontcg.io/swsh12pt5/logo.png",
  },
  {
    title: "Pokemon TCG Live",
    link: "https://tcg.pokemon.com/en-us/tcgl/",
    source: "Pokemon TCG Live",
    summary: "Digital companion platform news and release updates for the current TCG environment.",
    image: "https://images.pokemontcg.io/sv8/symbol.png",
  },
  {
    title: "Expansions Database",
    link: "https://www.pokemon.com/us/pokemon-tcg/trading-card-expansions/",
    source: "Pokemon TCG",
    summary: "Official set database to browse expansion releases and card list context while managing your binders.",
    image: "https://images.pokemontcg.io/base1/logo.png",
  },
  {
    title: "Pokemon Center TCG",
    link: "https://www.pokemoncenter.com/category/trading-card-game",
    source: "Pokemon Center",
    summary: "Product storefront for sealed releases, accessories, and recent TCG merchandise drops.",
    image: "https://images.pokemontcg.io/sv5/logo.png",
  },
];

const NEWS_CACHE_AGE_MS = 1000 * 60 * 45;
const NEWS_RSS_URL = "https://news.google.com/rss/search?q=Pokemon TCG&hl=en-US&gl=US&ceid=US:en";

const state = {
  cards: [],
  removedCards: [],
  removedBinders: [],
  binders: [
    defaultBinder(),
  ],
  profile: {
    name: "Collector",
    favorite: "",
    bio: "",
  },
  activeTheme: APP_THEMES[0],
  activeTab: "dashboard",
  analysis: null,
  news: [],
  newsFetchedAt: 0,
  pricesRecalculatedAt: 0,
};

const els = {
  app: byId("app"),
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".tab-panel"),

  themeBtn: byId("themeBtn"),

  startCameraBtn: byId("startCameraBtn"),
  cancelCameraBtn: byId("cancelCameraBtn"),
  captureBtn: byId("captureBtn"),
  uploadInput: byId("uploadInput"),
  cameraBox: byId("cameraBox"),
  cameraVideo: byId("cameraVideo"),
  scanStart: byId("scanStart"),
  previewWrap: byId("previewWrap"),
  previewImage: byId("previewImage"),
  analyzeBtn: byId("analyzeBtn"),
  resetScanBtn: byId("resetScanBtn"),
  scanStatus: byId("scanStatus"),

  resultPanel: byId("resultPanel"),
  resultName: byId("resultName"),
  resultMeta: byId("resultMeta"),
  resultGrade: byId("resultGrade"),
  scoreList: byId("scoreList"),
  analysisValues: byId("analysisValues"),
  analysisAutoInfo: byId("analysisAutoInfo"),
  editName: byId("editName"),
  editSet: byId("editSet"),
  editNumber: byId("editNumber"),
  editRarity: byId("editRarity"),
  editPurchase: byId("editPurchase"),
  editBinder: byId("editBinder"),
  saveCardBtn: byId("saveCardBtn"),
  scanAnotherBtn: byId("scanAnotherBtn"),

  searchInput: byId("searchInput"),
  sortSelect: byId("sortSelect"),
  binderFilter: byId("binderFilter"),
  collectionCount: byId("collectionCount"),
  collectionSummary: byId("collectionSummary"),
  recoveryPanel: byId("recoveryPanel"),
  binderShelf: byId("binderShelf"),

  profileName: byId("profileName"),
  profileFavorite: byId("profileFavorite"),
  profileBio: byId("profileBio"),
  saveProfileBtn: byId("saveProfileBtn"),
  portfolioStats: byId("portfolioStats"),
  portfolioHighlights: byId("portfolioHighlights"),
  portfolioBinderBreakdown: byId("portfolioBinderBreakdown"),
  recalcPricesBtn: byId("recalcPricesBtn"),
  pricesUpdatedLabel: byId("pricesUpdatedLabel"),
  exportDataBtn: byId("exportDataBtn"),
  importDataInput: byId("importDataInput"),

  dashboardSummary: byId("dashboardSummary"),
  dashboardSpotlight: byId("dashboardSpotlight"),
  refreshNewsBtn: byId("refreshNewsBtn"),
  newsStatus: byId("newsStatus"),
  newsFeed: byId("newsFeed"),
  binderBook: byId("binderBook"),
  binderBookLabel: byId("binderBookLabel"),
  binderBookTitle: byId("binderBookTitle"),
  binderBookPrev: byId("binderBookPrev"),
  binderBookNext: byId("binderBookNext"),
  binderBookClose: byId("binderBookClose"),
  binderBookPage: byId("binderBookPage"),
  binderBookLeftGrid: byId("binderBookLeftGrid"),
  binderBookRightGrid: byId("binderBookRightGrid"),
  binderBookPageLabel: byId("binderBookPageLabel"),

  cardDetailModal: byId("cardDetailModal"),
  cardDetailRemoveBtn: byId("cardDetailRemoveBtn"),
  cardDetailClose: byId("cardDetailClose"),
  cardDetailContext: byId("cardDetailContext"),
  cardDetailTitle: byId("cardDetailTitle"),
  cardDetailImage: byId("cardDetailImage"),
  cardDetailFlip: byId("cardDetailFlip"),
  cardDetailBackName: byId("cardDetailBackName"),
  cardDetailName: byId("cardDetailName"),
  cardDetailMeta: byId("cardDetailMeta"),
  cardDetailGradeRow: byId("cardDetailGradeRow"),
  cardDetailFields: byId("cardDetailFields"),

  binderEditor: byId("binderEditor"),
  binderEditorMeta: byId("binderEditorMeta"),
  editorBinderSelect: byId("editorBinderSelect"),
  editorPageSelect: byId("editorPageSelect"),
  editorSelectedCard: byId("editorSelectedCard"),
  editorCardPicker: byId("editorCardPicker"),
  editorSlotGrid: byId("editorSlotGrid"),
  closeEditorBtn: byId("closeEditorBtn"),

  newBinderBtn: byId("newBinderBtn"),
  binderManager: byId("binderManager"),

  cardItemTemplate: byId("cardItemTemplate"),
  newsItemTemplate: byId("newsItemTemplate"),
};

const runtime = {
  stream: null,
  imageDataUrl: null,
  imageBitmap: null,
  viewPageByBinder: {},
  dragCardId: null,
  openBinders: {},
  pageDoodles: {},
  decorationDrag: null,
  panelDrag: null,
  activeDetailCardId: null,
  slotMove: null,
  repricing: false,
  editor: {
    open: false,
    binderId: null,
    page: 1,
    selectedCardId: null,
  },
  book: {
    open: false,
    binderId: null,
    leftPage: 1,
    turning: false,
  },
};


function money(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(num);
}


function defaultBinder(name = "Main Binder") {
  const [a, b] = BINDER_STYLES.ocean;
  return {
    id: cryptoRandom(),
    name,
    style: "ocean",
    pages: 1,
    coverTitle: name,
    coverSubtitle: "",
    coverTitleScale: 100,
    coverColorA: a,
    coverColorB: b,
    sleeveColor: "#9cdfff",
    pageTint: "#0f1d2f",
    coverImage: "",
    coverImageScale: 100,
    coverImageFocusX: 50,
    coverImageFocusY: 50,
    cardScale: 86,
    cardGap: 8,
    compactList: false,
    clickMoveEnabled: true,
    lockCardArtFrame: false,
    cardImageFit: "cover",
    cardImageZoom: 100,
    cardImageFocusX: 50,
    cardImageFocusY: 50,
    pageMethodDefault: "classic",
    pageThemes: {},
  };
}


function hexSafe(value, fallback) {
  const v = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
}


async function resizeImageFile(file, maxDim, quality) {
  const dataUrl = await fileToDataUrl(file);
  return resizeDataUrl(dataUrl, maxDim, quality);
}

function resizeDataUrl(dataUrl, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => reject(new Error("Could not resize image"));
    image.src = dataUrl;
  });
}

function status(text) {
  els.scanStatus.textContent = text || "";
}

function byId(id) {
  return document.getElementById(id);
}

function cryptoRandom() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

// pokemontcg.io's free/unauthenticated tier returns intermittent 500s under
// light load. One short retry turns a lot of those into a successful lookup
// instead of a silent "low confidence" result.

function parseNullableNumber(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cleanText(value) {
  return String(value || "").trim();
}

function titleCase(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "");
}

