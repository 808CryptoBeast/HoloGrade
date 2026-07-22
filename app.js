const STORAGE_KEY = "holograde-state-v1";

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
  binderShelf: byId("binderShelf"),

  profileName: byId("profileName"),
  profileFavorite: byId("profileFavorite"),
  profileBio: byId("profileBio"),
  saveProfileBtn: byId("saveProfileBtn"),
  portfolioStats: byId("portfolioStats"),
  portfolioHighlights: byId("portfolioHighlights"),
  portfolioBinderBreakdown: byId("portfolioBinderBreakdown"),
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
  cardDetailClose: byId("cardDetailClose"),
  cardDetailContext: byId("cardDetailContext"),
  cardDetailTitle: byId("cardDetailTitle"),
  cardDetailImage: byId("cardDetailImage"),
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

init();

function init() {
  loadState();
  applyTheme(state.activeTheme);
  wireTabs();
  wireScan();
  wireCollection();
  wireBinders();
  wirePortfolio();
  wireDashboard();
  wireBinderBook();
  wireCardDetailModal();
  wireTopbar();
  refreshBinderSelects();
  renderResult(null);
  renderPortfolio();
  renderDashboard();
  renderCollection();
  renderBinderManager();
  maybeRefreshNews();
}

function wireTopbar() {
  els.themeBtn.addEventListener("click", () => {
    const idx = APP_THEMES.indexOf(state.activeTheme);
    const next = APP_THEMES[(idx + 1) % APP_THEMES.length];
    applyTheme(next);
    persist();
  });
}

function wireTabs() {
  els.tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTab(btn.dataset.tab);
    });
  });
  setTab(state.activeTab || "scan");
}

function setTab(tabName) {
  state.activeTab = tabName;
  els.tabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
  els.panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
  if (tabName !== "scan") {
    stopCamera();
  }
  if (tabName !== "collection") {
    closeBinderBook();
  }
  if (tabName === "portfolio") {
    renderPortfolio();
  }
  if (tabName === "dashboard") {
    renderDashboard();
  }
  persist();
}

function wireBinderBook() {
  els.binderBookClose.addEventListener("click", closeBinderBook);
  els.binderBookPrev.addEventListener("click", () => turnBinderBook(-2));
  els.binderBookNext.addEventListener("click", () => turnBinderBook(2));
  els.binderBook.addEventListener("click", (event) => {
    if (event.target === els.binderBook) {
      closeBinderBook();
    }
  });
}

function wireCardDetailModal() {
  if (!els.cardDetailModal) return;
  els.cardDetailClose.addEventListener("click", closeCardDetailModal);
  els.cardDetailModal.addEventListener("click", (event) => {
    if (event.target === els.cardDetailModal) {
      closeCardDetailModal();
    }
  });
}

function wireDashboard() {
  els.refreshNewsBtn.addEventListener("click", () => {
    fetchNews(true);
  });
}

function wirePortfolio() {
  els.saveProfileBtn.addEventListener("click", () => {
    state.profile.name = cleanText(els.profileName.value) || "Collector";
    state.profile.favorite = cleanText(els.profileFavorite.value);
    state.profile.bio = cleanText(els.profileBio.value);
    persist();
    renderPortfolio();
    status("Profile saved.");
  });
  els.exportDataBtn.addEventListener("click", exportBackup);
  els.importDataInput.addEventListener("change", importBackup);
}

function renderPortfolio() {
  if (!els.profileName) return;

  els.profileName.value = state.profile.name || "";
  els.profileFavorite.value = state.profile.favorite || "";
  els.profileBio.value = state.profile.bio || "";

  const total = state.cards.length;
  const avgGrade = total ? state.cards.reduce((sum, c) => sum + (Number(c.grade) || 0), 0) / total : 0;
  const invested = state.cards.filter((c) => c.purchasePrice != null);
  const spent = invested.reduce((sum, c) => sum + Number(c.purchasePrice || 0), 0);
  const rawTotal = state.cards.reduce((sum, c) => sum + Number(c.rawValue || 0), 0);
  const gradedTotal = state.cards.reduce((sum, c) => sum + getEstimatedGradedValue(c), 0);
  const totalPL = invested.reduce((sum, c) => sum + (Number(c.rawValue || 0) - Number(c.purchasePrice || 0)), 0);
  const topCard = [...state.cards].sort((a, b) => (Number(b.grade) || 0) - (Number(a.grade) || 0))[0];

  els.portfolioStats.innerHTML = `
    <div><span>Collector</span><strong>${escapeHtml(state.profile.name || "Collector")}</strong></div>
    <div><span>Total Cards</span><strong>${total}</strong></div>
    <div><span>Avg Grade</span><strong>${total ? avgGrade.toFixed(2) : "-"}</strong></div>
    <div><span>Raw Total</span><strong>${money(rawTotal)}</strong></div>
    <div><span>Graded Total</span><strong>${money(gradedTotal)}</strong></div>
    <div><span>P / L</span><strong>${invested.length ? money(totalPL) : "-"}</strong></div>
  `;

  const notes = [
    state.profile.favorite ? `Favorite Pokemon: ${state.profile.favorite}` : "Set your favorite Pokemon in your profile.",
    state.profile.bio ? state.profile.bio : "Add a short collector bio.",
    topCard ? `Top graded card: ${topCard.name} (EST ${Number(topCard.grade).toFixed(1)})` : "Scan a card to build portfolio highlights.",
    invested.length ? `Tracked spend: $${spent.toFixed(2)} · current raw P/L ${money(totalPL)}` : "Add purchase prices to track investment.",
  ];

  els.portfolioHighlights.innerHTML = `<p>${notes.map((n) => escapeHtml(n)).join("<br />")}</p>`;

  const breakdown = state.binders.map((binder) => {
    const cards = state.cards.filter((c) => c.binderId === binder.id);
    const binderRaw = cards.reduce((sum, c) => sum + Number(c.rawValue || 0), 0);
    const binderGraded = cards.reduce((sum, c) => sum + getEstimatedGradedValue(c), 0);
    const binderPL = cards
      .filter((c) => c.purchasePrice != null)
      .reduce((sum, c) => sum + (Number(c.rawValue || 0) - Number(c.purchasePrice || 0)), 0);
    return { binder, count: cards.length, binderRaw, binderGraded, binderPL };
  });

  els.portfolioBinderBreakdown.innerHTML = breakdown.map(({ binder, count, binderRaw, binderGraded, binderPL }) => `
    <div class="binder-breakdown-item">
      <strong>${escapeHtml(binder.coverTitle || binder.name)}</strong>
      <p>${count} cards · Raw ${money(binderRaw)} · Graded ${money(binderGraded)} · P/L ${money(binderPL)}</p>
      <div class="binder-chart-wrap">${renderSparklineSvg(getBinderHistorySeries(binder.id), money(binderRaw))}</div>
    </div>
  `).join("");
}

function wireScan() {
  els.startCameraBtn.addEventListener("click", async () => {
    await openCamera();
  });

  els.cancelCameraBtn.addEventListener("click", () => {
    stopCamera();
    status("Camera closed.");
  });

  els.captureBtn.addEventListener("click", async () => {
    const shot = captureFromVideo();
    if (!shot) {
      status("Could not capture image. Try again.");
      return;
    }
    await setScanImage(shot);
    stopCamera();
    status("Photo captured. Ready to analyze.");
  });

  els.uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    await setScanImage(dataUrl);
    status("Image uploaded. Ready to analyze.");
    event.target.value = "";
  });

  els.analyzeBtn.addEventListener("click", analyzeCurrentImage);
  els.resetScanBtn.addEventListener("click", resetScanFlow);
  els.scanAnotherBtn.addEventListener("click", resetScanFlow);
  els.saveCardBtn.addEventListener("click", saveAnalyzedCard);
}

async function openCamera() {
  if (!window.isSecureContext) {
    status("Camera requires a secure page (HTTPS or localhost). Upload photo or run with a local server.");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    status("Camera is not supported on this browser. Use upload instead.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    runtime.stream = stream;
    els.cameraVideo.srcObject = stream;
    els.cameraBox.classList.remove("hidden");
    status("Camera ready. Place card in frame and capture.");
  } catch (error) {
    status("Camera permission denied or unavailable. Use upload photo.");
  }
}

function stopCamera() {
  if (runtime.stream) {
    runtime.stream.getTracks().forEach((track) => track.stop());
    runtime.stream = null;
  }
  els.cameraBox.classList.add("hidden");
}

function captureFromVideo() {
  const video = els.cameraVideo;
  if (!video.videoWidth || !video.videoHeight) return null;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

async function setScanImage(dataUrl) {
  runtime.imageDataUrl = dataUrl;
  runtime.imageBitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
  els.previewImage.src = dataUrl;
  els.previewWrap.classList.remove("hidden");
  els.scanStart.classList.add("hidden");
  state.analysis = null;
  renderResult(null);
}

async function analyzeCurrentImage() {
  if (!runtime.imageBitmap || !runtime.imageDataUrl) {
    status("Add a card image first.");
    return;
  }

  status("Analyzing card condition...");
  const quality = estimateCondition(runtime.imageBitmap);

  status("Reading card text with OCR...");
  const text = await runOcr(runtime.imageDataUrl);

  status("Looking up Pokemon card data...");
  const cardInfo = await identifyCard(text);

  const analysis = buildAnalysisResult(quality, cardInfo, text);
  state.analysis = analysis;
  renderResult(analysis);
  status(`Analysis complete. Auto-filled ${analysis.autoFieldCount} fields. Review and save.`);
}

function estimateCondition(imageBitmap) {
  const width = imageBitmap.width;
  const height = imageBitmap.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(imageBitmap, 0, 0);

  const data = ctx.getImageData(0, 0, width, height).data;
  const centerBox = sampleRegion(data, width, height, 0.2, 0.2, 0.8, 0.8);
  const edgeBox = sampleRegion(data, width, height, 0.02, 0.02, 0.98, 0.98, true);

  const centerVariance = luminanceVariance(centerBox);
  const edgeVariance = luminanceVariance(edgeBox);
  const sharpness = sobelSharpness(data, width, height);

  const centeringScore = clamp(7 + contrastRatio(centerBox, edgeBox) * 2.5, 4.8, 9.9);
  const cornersScore = clamp(8.6 - edgeVariance * 1.8, 4.5, 9.8);
  const edgesScore = clamp(7.5 + sharpness * 2.2 - edgeVariance * 0.8, 4.5, 9.8);
  const surfaceScore = clamp(7.4 + centerVariance * 1.3 - edgeVariance * 0.5, 4.6, 9.8);

  const weighted = (
    centeringScore * 0.24 +
    cornersScore * 0.24 +
    edgesScore * 0.24 +
    surfaceScore * 0.28
  );

  return {
    centering: round1(centeringScore),
    corners: round1(cornersScore),
    edges: round1(edgesScore),
    surface: round1(surfaceScore),
    grade: round1(clamp(weighted, 4.5, 10)),
  };
}

async function runOcr(dataUrl) {
  if (!window.Tesseract) return "";
  try {
    const result = await window.Tesseract.recognize(dataUrl, "eng", {
      logger: (m) => {
        if (m.status && m.progress != null) {
          const percent = Math.round(m.progress * 100);
          status(`OCR: ${m.status} ${percent}%`);
        }
      },
    });

    // A second pass on an enhanced top-strip helps recover the card name line.
    const topStrip = await makeTopStripDataUrl(dataUrl);
    const topResult = await window.Tesseract.recognize(topStrip, "eng");

    return [result?.data?.text || "", topResult?.data?.text || ""]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

async function identifyCard(ocrText) {
  const cleaned = sanitizeOcrText(ocrText);
  const probableName = guessPokemonName(cleaned);
  const tokens = extractSearchTokens(cleaned);
  const ocrHints = extractOcrCardHints(cleaned);

  if (!probableName && !tokens.length) {
    return {
      found: false,
      name: ocrHints.name || "Unknown Card",
      set: ocrHints.set || "Unknown Set",
      number: ocrHints.number || "",
      rarity: ocrHints.rarity || "",
      confidence: "low",
      autoRecord: ocrHints,
    };
  }

  const candidates = [];
  const seen = new Set();

  const queries = [];
  if (probableName) {
    queries.push(`name:"${probableName}"`);
    queries.push(`name:${probableName}`);
    queries.push(`name:*${probableName}*`);
  }
  tokens.slice(0, 6).forEach((token) => {
    queries.push(`name:*${token}*`);
  });

  try {
    for (const q of queries) {
      const params = new URLSearchParams({
        q,
        pageSize: "35",
      });
      const url = `https://api.pokemontcg.io/v2/cards?${params.toString()}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        continue;
      }
      const json = await resp.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      rows.forEach((row) => {
        if (!row?.id || seen.has(row.id)) return;
        seen.add(row.id);
        candidates.push(row);
      });
      if (candidates.length >= 120) break;
    }

    if (!candidates.length) {
      return {
        found: false,
        name: ocrHints.name || titleCase(probableName || tokens[0] || "Unknown Card"),
        set: ocrHints.set || "Unknown Set",
        number: ocrHints.number || "",
        rarity: ocrHints.rarity || "",
        confidence: "medium",
        autoRecord: ocrHints,
      };
    }

    const scored = candidates
      .map((card) => ({ card, score: scoreCardMatch(card, cleaned) }))
      .sort((a, b) => b.score - a.score);

    const first = scored[0].card;
    const autoRecord = {
      ...ocrHints,
      ...extractAutoCardData(first),
    };

    return {
      found: true,
      name: autoRecord.name || first.name || titleCase(probableName),
      set: autoRecord.set || first.set?.name || "Unknown Set",
      number: autoRecord.number || first.number || "",
      rarity: autoRecord.rarity || first.rarity || "",
      values: extractCardValues(first),
      confidence: "high",
      autoRecord,
    };
  } catch {
    return {
      found: false,
      name: ocrHints.name || titleCase(probableName || tokens[0] || "Unknown Card"),
      set: ocrHints.set || "Unknown Set",
      number: ocrHints.number || "",
      rarity: ocrHints.rarity || "",
      confidence: "low",
      autoRecord: ocrHints,
    };
  }
}

function buildAnalysisResult(quality, cardInfo, ocrText) {
  const autoRecord = cardInfo.autoRecord || extractOcrCardHints(ocrText);
  const note = cardInfo.found
    ? "Card match found from OCR text and public TCG database."
    : "Card match is uncertain. Edit fields before saving.";

  return {
    name: cardInfo.name || autoRecord.name || "Unknown Card",
    set: cardInfo.set || autoRecord.set || "Unknown Set",
    number: cardInfo.number || autoRecord.number || "",
    rarity: cardInfo.rarity || autoRecord.rarity || "",
    values: cardInfo.values || estimateFallbackValues(0),
    confidence: cardInfo.confidence,
    note,
    ocrExcerpt: ocrText?.slice(0, 160) || "",
    condition: quality,
    autoRecord,
    autoFieldCount: countAutoCapturedFields(autoRecord),
  };
}

function renderResult(analysis) {
  if (!analysis) {
    els.resultPanel.classList.add("hidden");
    return;
  }

  els.resultPanel.classList.remove("hidden");
  els.resultName.textContent = analysis.name;
  els.resultMeta.textContent = [analysis.set, analysis.number && `#${analysis.number}`, analysis.rarity]
    .filter(Boolean)
    .join(" · ") || "Card details pending";
  els.resultGrade.textContent = analysis.condition.grade.toFixed(1);

  els.scoreList.innerHTML = "";
  addScoreRow("Centering", analysis.condition.centering);
  addScoreRow("Corners", analysis.condition.corners);
  addScoreRow("Edges", analysis.condition.edges);
  addScoreRow("Surface", analysis.condition.surface);

  els.analysisValues.innerHTML = `
    <div><span>Raw Est.</span><strong>${money(analysis.values?.raw)}</strong></div>
    <div><span>PSA 9 Est.</span><strong>${money(analysis.values?.psa9)}</strong></div>
    <div><span>PSA 10 Est.</span><strong>${money(analysis.values?.psa10)}</strong></div>
  `;

  els.editName.value = analysis.name || "";
  els.editSet.value = analysis.set || "";
  els.editNumber.value = analysis.number || "";
  els.editRarity.value = analysis.rarity || "";
  els.editPurchase.value = "";

  renderAutoInfoGrid(els.analysisAutoInfo, analysis.autoRecord, {
    fields: [
      ["Card ID", analysis.autoRecord?.tcg?.id],
      ["Set ID", analysis.autoRecord?.tcg?.setId],
      ["Series", analysis.autoRecord?.tcg?.setSeries],
      ["Release", analysis.autoRecord?.tcg?.releaseDate],
      ["HP", analysis.autoRecord?.hp],
      ["Type", joinList(analysis.autoRecord?.types)],
      ["Subtype", joinList(analysis.autoRecord?.subtypes)],
      ["Evolves From", analysis.autoRecord?.evolvesFrom],
      ["Artist", analysis.autoRecord?.artist],
      ["Reg. Mark", analysis.autoRecord?.regulationMark],
      ["Abilities", asCountLabel(analysis.autoRecord?.abilities, "ability")],
      ["Attacks", asCountLabel(analysis.autoRecord?.attacks, "attack")],
      ["Rules", asCountLabel(analysis.autoRecord?.rules, "rule")],
      ["Scan Confidence", analysis.confidence],
      ["Auto Fields", String(analysis.autoFieldCount || 0)],
    ],
  });

  refreshBinderSelects();
}

function addScoreRow(label, value) {
  const row = document.createElement("div");
  row.className = "score-row";
  row.innerHTML = `
    <span>${label}</span>
    <div class="bar"><div class="fill" style="width:${Math.max(0, Math.min(100, value * 10))}%"></div></div>
    <strong>${value.toFixed(1)}</strong>
  `;
  els.scoreList.appendChild(row);
}

function saveAnalyzedCard() {
  if (!state.analysis || !runtime.imageDataUrl) {
    status("No analysis available to save.");
    return;
  }

  const binderId = els.editBinder.value;
  const binder = state.binders.find((b) => b.id === binderId);
  if (!binder) {
    status("Please select a valid binder.");
    return;
  }

  const page = findPageWithSpace(binderId);
  const slotOrder = getNextSlotOrder(binderId, page);
  const auto = state.analysis.autoRecord || {};
  const savedAt = Date.now();

  const card = {
    id: cryptoRandom(),
    name: cleanText(els.editName.value) || "Unknown Card",
    set: cleanText(els.editSet.value) || "Unknown Set",
    number: cleanText(els.editNumber.value),
    rarity: cleanText(els.editRarity.value),
    grade: state.analysis.condition.grade,
    subgrades: { ...state.analysis.condition },
    rawValue: Number(state.analysis.values?.raw) || 0,
    psa9Value: Number(state.analysis.values?.psa9) || 0,
    psa10Value: Number(state.analysis.values?.psa10) || 0,
    binderId,
    page,
    slotOrder,
    purchasePrice: parseNullableNumber(els.editPurchase.value),
    image: runtime.imageDataUrl,
    addedAt: savedAt,
    hp: cleanText(auto.hp),
    supertype: cleanText(auto.supertype),
    subtypes: Array.isArray(auto.subtypes) ? auto.subtypes : [],
    types: Array.isArray(auto.types) ? auto.types : [],
    evolvesFrom: cleanText(auto.evolvesFrom),
    evolvesTo: Array.isArray(auto.evolvesTo) ? auto.evolvesTo : [],
    abilities: Array.isArray(auto.abilities) ? auto.abilities : [],
    attacks: Array.isArray(auto.attacks) ? auto.attacks : [],
    weaknesses: Array.isArray(auto.weaknesses) ? auto.weaknesses : [],
    resistances: Array.isArray(auto.resistances) ? auto.resistances : [],
    retreatCost: Array.isArray(auto.retreatCost) ? auto.retreatCost : [],
    convertedRetreatCost: Number(auto.convertedRetreatCost) || 0,
    artist: cleanText(auto.artist),
    regulationMark: cleanText(auto.regulationMark),
    flavorText: cleanText(auto.flavorText),
    rules: Array.isArray(auto.rules) ? auto.rules : [],
    legalities: auto.legalities && typeof auto.legalities === "object" ? auto.legalities : {},
    nationalPokedexNumbers: Array.isArray(auto.nationalPokedexNumbers) ? auto.nationalPokedexNumbers : [],
    tcg: auto.tcg && typeof auto.tcg === "object" ? auto.tcg : null,
    apiImages: auto.images && typeof auto.images === "object" ? auto.images : null,
    scan: {
      confidence: cleanText(state.analysis.confidence) || "unknown",
      ocrExcerpt: cleanText(state.analysis.ocrExcerpt),
      autoFieldCount: Number(state.analysis.autoFieldCount) || 0,
      savedAt,
    },
  };

  state.cards.unshift(card);
  persist();
  renderCollection();
  renderBinderManager();
  resetScanFlow();
  setTab("collection");
  status(`Saved ${card.name} to ${binder.name}.`);
}

function resetScanFlow() {
  stopCamera();
  runtime.imageDataUrl = null;
  runtime.imageBitmap = null;
  state.analysis = null;

  els.previewImage.src = "";
  els.previewWrap.classList.add("hidden");
  els.scanStart.classList.remove("hidden");
  els.resultPanel.classList.add("hidden");
  status("Ready for next card.");
}

function wireCollection() {
  els.searchInput.addEventListener("input", renderCollection);
  els.sortSelect.addEventListener("change", renderCollection);
  els.binderFilter.addEventListener("change", renderCollection);
  els.closeEditorBtn.addEventListener("click", closeBinderEditor);
  els.editorBinderSelect.addEventListener("change", () => {
    runtime.editor.binderId = els.editorBinderSelect.value;
    runtime.editor.page = 1;
    runtime.editor.selectedCardId = null;
    renderBinderEditor();
  });
  els.editorPageSelect.addEventListener("change", () => {
    runtime.editor.page = Number(els.editorPageSelect.value) || 1;
    renderBinderEditor();
  });
}

function renderCollection() {
  refreshBinderSelects();
  renderPortfolio();
  renderBinderEditor();
  if (runtime.book.open) {
    renderBinderBook();
  }

  const filterText = cleanText(els.searchInput.value).toLowerCase();
  const binderFilter = els.binderFilter.value || "all";
  const sortBy = els.sortSelect.value;

  const filtered = state.cards
    .filter((card) => {
      if (binderFilter !== "all" && card.binderId !== binderFilter) return false;
      if (!filterText) return true;
      const haystack = `${card.name} ${card.set} ${card.number}`.toLowerCase();
      return haystack.includes(filterText);
    });

  els.collectionCount.textContent = `${filtered.length} card${filtered.length === 1 ? "" : "s"}`;
  renderSummary();

  const binders = state.binders
    .map((binder) => ({
      binder,
      cards: filtered.filter((c) => c.binderId === binder.id),
      allCards: state.cards.filter((c) => c.binderId === binder.id),
    }))
    .filter(({ binder, cards, allCards }) => cards.length > 0 || allCards.length > 0 || binderFilter === binder.id);

  els.binderShelf.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No cards match your current filters.";
    els.binderShelf.appendChild(empty);
    return;
  }

  binders.forEach(({ binder, cards, allCards }) => {
    const block = document.createElement("section");
    const isOpen = !!runtime.openBinders[binder.id];
    block.className = `binder-block ${isOpen ? "open" : "closed"}`;

    const [c1, c2] = BINDER_STYLES[binder.style] || BINDER_STYLES.ocean;
    const totalPages = Math.max(1, Number(binder.pages) || 1);
    const currentPage = clamp(getViewedPage(binder.id, totalPages), 1, totalPages);
    runtime.viewPageByBinder[binder.id] = currentPage;

    const coverTitle = cleanText(binder.coverTitle) || binder.name;
    const coverA = binder.coverColorA || c1;
    const coverB = binder.coverColorB || c2;
    const coverSize = `${clamp(Number(binder.coverImageScale) || 100, 70, 220)}%`;
    const coverPosition = `${clamp(Number(binder.coverImageFocusX) || 50, 0, 100)}% ${clamp(Number(binder.coverImageFocusY) || 50, 0, 100)}%`;
    const pageTheme = getPageTheme(binder, currentPage);
    const sleeve = pageTheme.sleeveColor || binder.sleeveColor || "#9cdfff";
    const pageTint = pageTheme.pageTint || binder.pageTint || "#0f1d2f";
    const coverBg = binder.coverImage
      ? `linear-gradient(rgba(3,12,22,.22), rgba(3,12,22,.62)), url(${binder.coverImage})`
      : `linear-gradient(120deg, ${coverA}40, ${coverB}40)`;
    const pageDoodle = getPageDoodlePattern(pageTheme.patternStyle || binder.style, currentPage, pageTheme.patternStrength);

    const cardsOnPage = cards.filter((c) => Number(c.page || 1) === currentPage);
    const allCardsOnPage = allCards.filter((c) => Number(c.page || 1) === currentPage);
    const sortedCardsOnPage = sortCardsForPage(cardsOnPage, sortBy);

    const pageOptions = Array.from({ length: totalPages }, (_, i) => {
      const page = i + 1;
      return `<option value="${page}" ${page === currentPage ? "selected" : ""}>Page ${page}</option>`;
    }).join("");

    block.innerHTML = `
      <button class="binder-cover-card" data-action="toggle-binder" type="button" style="background-image:${coverBg}; background-size:${binder.coverImage ? `${coverSize}, ${coverSize}` : "cover"}; background-position:${binder.coverImage ? `${coverPosition}, ${coverPosition}` : "center"};">
        <span class="binder-spine"></span>
        <span class="binder-cover-copy">
          <span class="binder-cover-title">${escapeHtml(coverTitle)}</span>
          <span class="binder-cover-meta">${cards.length} cards · ${totalPages} page${totalPages === 1 ? "" : "s"}</span>
        </span>
      </button>

      <div class="binder-interior">
      <header class="binder-header" style="background-image:${coverBg}; background-size:${binder.coverImage ? `${coverSize}, ${coverSize}` : "cover"}; background-position:${binder.coverImage ? `${coverPosition}, ${coverPosition}` : "center"};">
        <div>
          <h3>${escapeHtml(coverTitle)}</h3>
          <p class="meta">${cards.length} cards · Page ${currentPage} of ${totalPages} · ${escapeHtml(getPageMethodLabel(pageTheme.method))} Method</p>
        </div>
        <div class="page-controls">
          <button class="btn ghost small" data-action="toggle-binder" type="button">Close</button>
          <button class="btn ghost small" data-action="open-book" type="button">Open Book</button>
          <button class="btn ghost small" data-action="edit-page" type="button">Edit Page</button>
          <button class="btn ghost small" data-action="prev-page" type="button">Prev</button>
          <button class="btn ghost small" data-action="next-page" type="button">Next</button>
          <select data-action="jump-page" class="move-page-select">${pageOptions}</select>
          <button class="btn primary small" data-action="add-page" type="button">Add Page</button>
          <button class="btn ghost small" data-action="remove-page" type="button">Remove Page</button>
        </div>
      </header>
      <div class="binder-grid" data-binder-id="${binder.id}" data-page="${currentPage}"></div>
      <div class="card-list"></div>
      </div>
    `;

    const toggleButtons = block.querySelectorAll('button[data-action="toggle-binder"]');
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        runtime.openBinders[binder.id] = !runtime.openBinders[binder.id];
        renderCollection();
      });
    });

    const prevBtn = block.querySelector('button[data-action="prev-page"]');
    const nextBtn = block.querySelector('button[data-action="next-page"]');
    const jumpSelect = block.querySelector('select[data-action="jump-page"]');
    const addBtn = block.querySelector('button[data-action="add-page"]');
    const removeBtn = block.querySelector('button[data-action="remove-page"]');
    const editBtn = block.querySelector('button[data-action="edit-page"]');
    const bookBtn = block.querySelector('button[data-action="open-book"]');
    prevBtn.disabled = currentPage <= 1;
    editBtn.addEventListener("click", () => {
      openBinderEditor(binder.id, currentPage);
    });
    bookBtn.addEventListener("click", () => {
      openBinderBook(binder.id, currentPage % 2 === 0 ? currentPage - 1 : currentPage);
    });

    nextBtn.disabled = currentPage >= totalPages;
    removeBtn.disabled = totalPages <= 1 || currentPage !== totalPages || allCardsOnPage.length > 0;

    prevBtn.addEventListener("click", () => {
      runtime.viewPageByBinder[binder.id] = clamp(currentPage - 1, 1, totalPages);
      renderCollection();
    });

    nextBtn.addEventListener("click", () => {
      runtime.viewPageByBinder[binder.id] = clamp(currentPage + 1, 1, totalPages);
      renderCollection();
    });

    jumpSelect.addEventListener("change", () => {
      runtime.viewPageByBinder[binder.id] = clamp(Number(jumpSelect.value) || 1, 1, totalPages);
      renderCollection();
    });

    addBtn.addEventListener("click", () => {
      binder.pages = totalPages + 1;
      runtime.viewPageByBinder[binder.id] = binder.pages;
      persist();
      renderCollection();
      renderBinderManager();
      status(`Added page ${binder.pages} in ${binder.name}.`);
    });

    removeBtn.addEventListener("click", () => {
      if (totalPages <= 1) return;
      if (currentPage !== totalPages) {
        status("Only the last page can be removed.");
        return;
      }
      if (allCardsOnPage.length > 0) {
        status("Move cards off this page before removing it.");
        return;
      }
      binder.pages = totalPages - 1;
      runtime.viewPageByBinder[binder.id] = clamp(currentPage, 1, binder.pages);
      persist();
      renderCollection();
      renderBinderManager();
      status(`Removed page ${totalPages} from ${binder.name}.`);
    });

    const grid = block.querySelector(".binder-grid");
    applyPageThemeToGrid(grid, pageTheme, pageDoodle);
    renderPageDecorations(grid, binder, currentPage);

    const reservedSlots = getReservedSlotsForTheme(pageTheme);
    const placedCards = allCardsOnPage.filter((card) => Number(card.slotOrder) >= 1 && Number(card.slotOrder) <= 9);
    for (let i = 0; i < 9; i += 1) {
      const slotNumber = i + 1;
      if (renderPageLayoutItem(grid, slotNumber, pageTheme)) {
        continue;
      }
      if (reservedSlots.has(slotNumber)) {
        continue;
      }
      const slotCard = placedCards.find((card) => Number(card.slotOrder) === slotNumber);
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.slot = String(slotNumber);
      slot.style.setProperty("--slot-border", sleeve);
      slot.style.setProperty("--slot-bg", `${sleeve}22`);
      if (slotCard) {
        const img = document.createElement("img");
        img.src = slotCard.image;
        img.alt = `${slotCard.name} thumbnail`;
        slot.appendChild(img);
        slot.classList.add("has-card");
        slot.addEventListener("click", () => {
          openCardDetailModal(slotCard, {
            binderName: binder.coverTitle || binder.name,
            page: currentPage,
            slot: slotNumber,
          });
        });
      } else {
        slot.classList.add("empty");
        slot.textContent = "Empty";
      }
      const slotBadge = document.createElement("span");
      slotBadge.className = "slot-number";
      slotBadge.textContent = String(slotNumber);
      slot.appendChild(slotBadge);

      if (sortBy === "binder") {
        slot.addEventListener("dragover", (event) => {
          event.preventDefault();
          event.stopPropagation();
          slot.classList.add("drag-target");
        });

        slot.addEventListener("dragleave", () => {
          slot.classList.remove("drag-target");
        });

        slot.addEventListener("drop", (event) => {
          event.preventDefault();
          event.stopPropagation();
          slot.classList.remove("drag-target");
          if (!runtime.dragCardId) return;
          placeCardInSlot(runtime.dragCardId, binder.id, currentPage, slotNumber);
          runtime.dragCardId = null;
        });
      }
      grid.appendChild(slot);
    }

    if (sortBy === "binder") {
      grid.addEventListener("dragover", (event) => {
        event.preventDefault();
        grid.classList.add("drag-over-grid");
      });

      grid.addEventListener("dragleave", () => {
        grid.classList.remove("drag-over-grid");
      });

      grid.addEventListener("drop", (event) => {
        event.preventDefault();
        grid.classList.remove("drag-over-grid");
        if (!runtime.dragCardId) return;

        moveCardToPage(runtime.dragCardId, binder.id, currentPage);
        runtime.dragCardId = null;
      });
    }

    const list = block.querySelector(".card-list");
    list.dataset.binderId = binder.id;
    list.dataset.page = String(currentPage);
    list.classList.toggle("dnd-disabled", sortBy !== "binder");

    sortedCardsOnPage.forEach((card) => {
      list.appendChild(renderCardItem(card, {
        binderId: binder.id,
        page: currentPage,
        totalPages,
        dndEnabled: sortBy === "binder",
      }));
    });

    if (!sortedCardsOnPage.length) {
      const emptyPage = document.createElement("p");
      emptyPage.className = "muted";
      emptyPage.textContent = filterText
        ? "No cards on this page match your search."
        : "This binder page is empty. Add cards or create another page.";
      list.appendChild(emptyPage);
    }

    els.binderShelf.appendChild(block);
  });
}

function openBinderBook(binderId, leftPage = 1) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return;
  runtime.book.open = true;
  runtime.book.binderId = binderId;
  runtime.book.leftPage = clamp(Number(leftPage) || 1, 1, Math.max(1, Number(binder.pages || 1)));
  if (runtime.book.leftPage % 2 === 0) runtime.book.leftPage -= 1;
  els.binderBook.classList.remove("hidden");
  els.binderBook.setAttribute("aria-hidden", "false");
  renderBinderBook();
}

function closeBinderBook() {
  runtime.book.open = false;
  runtime.book.binderId = null;
  runtime.book.leftPage = 1;
  runtime.book.turning = false;
  if (els.binderBook) {
    els.binderBook.classList.add("hidden");
    els.binderBook.setAttribute("aria-hidden", "true");
  }
}

function turnBinderBook(delta) {
  if (!runtime.book.open || runtime.book.turning) return;
  const binder = state.binders.find((item) => item.id === runtime.book.binderId);
  if (!binder) return;
  const maxPage = Math.max(1, Number(binder.pages || 1));
  const target = clamp(runtime.book.leftPage + delta, 1, maxPage % 2 === 0 ? maxPage - 1 : maxPage);
  if (target === runtime.book.leftPage) return;

  runtime.book.turning = true;
  els.binderBookPage.classList.remove("turn-next", "turn-prev");
  void els.binderBookPage.offsetWidth;
  els.binderBookPage.classList.add(delta > 0 ? "turn-next" : "turn-prev");
  window.setTimeout(() => {
    runtime.book.leftPage = target;
    renderBinderBook();
    els.binderBookPage.classList.remove("turn-next", "turn-prev");
    runtime.book.turning = false;
  }, 480);
}

function renderBinderBook() {
  if (!runtime.book.open) return;
  const binder = state.binders.find((item) => item.id === runtime.book.binderId);
  if (!binder) {
    closeBinderBook();
    return;
  }

  const leftPage = clamp(runtime.book.leftPage, 1, Math.max(1, Number(binder.pages || 1)));
  const rightPage = Math.min(leftPage + 1, Math.max(1, Number(binder.pages || 1)));
  const leftCards = getPageCards(binder.id, leftPage);
  const rightCards = getPageCards(binder.id, rightPage);

  els.binderBookLabel.textContent = `${binder.coverTitle || binder.name} · Fullscreen View`;
  els.binderBookTitle.textContent = binder.coverTitle || binder.name;
  els.binderBookPageLabel.textContent = `Pages ${leftPage}${rightPage !== leftPage ? `-${rightPage}` : ""}`;
  els.binderBookPrev.disabled = leftPage <= 1 || runtime.book.turning;
  els.binderBookNext.disabled = rightPage >= Number(binder.pages || 1) || runtime.book.turning;

  renderBinderBookGrid(els.binderBookLeftGrid, leftCards, leftPage, binder);
  renderBinderBookGrid(els.binderBookRightGrid, rightCards, rightPage, binder);
}

function renderBinderBookGrid(target, cards, page, binder) {
  target.innerHTML = "";
  const pageTheme = getPageTheme(binder, page);
  const pageDoodle = getPageDoodlePattern(pageTheme.patternStyle || binder.style, page, pageTheme.patternStrength);
  applyPageThemeToGrid(target, pageTheme, pageDoodle);
  renderPageScenePanels(target, pageTheme, { mode: "book" });
  renderPageDecorations(target, binder, page);
  const reservedSlots = getReservedSlotsForTheme(pageTheme);
  for (let slotNumber = 1; slotNumber <= 9; slotNumber += 1) {
    if (reservedSlots.has(slotNumber)) continue;
    const card = cards.find((item) => Number(item.slotOrder || 0) === slotNumber);
    const slot = document.createElement("div");
    slot.className = `binder-book-slot${card ? "" : " empty"}`;
    slot.innerHTML = `
      <span class="binder-book-slot-label">P${page} · ${slotNumber}</span>
      ${card ? `<img src="${card.image}" alt="${escapeAttr(card.name)}" />` : "Empty"}
      ${card ? `<span class="binder-book-slot-name">${escapeHtml(card.name)}</span>` : ""}
    `;
    if (card) {
      slot.classList.add("has-card");
      slot.addEventListener("click", () => {
        openCardDetailModal(card, {
          binderName: binder?.coverTitle || binder?.name || "Binder",
          page,
          slot: slotNumber,
        });
      });
    }
    target.appendChild(slot);
  }
}

function getPageCards(binderId, page) {
  return sortCardsForPage(
    state.cards.filter((card) => card.binderId === binderId && Number(card.page || 1) === Number(page)),
    "binder",
  );
}

function getPageTheme(binder, page) {
  const fallbackMethod = cleanText(binder.pageMethodDefault) || "classic";
  const fallbackPreset = PAGE_METHOD_PRESETS[fallbackMethod] || PAGE_METHOD_PRESETS.classic;
  const fromMap = binder.pageThemes?.[String(page)] || {};
  const legacyLayoutPreset = cleanText(fromMap.layoutPreset) || "grid";
  const legacySceneImage = cleanText(fromMap.sceneImage);

  return {
    method: cleanText(fromMap.method) || fallbackMethod,
    patternStyle: cleanText(fromMap.patternStyle) || fallbackPreset.patternStyle || binder.style || "ocean",
    pageTint: hexSafe(fromMap.pageTint, fallbackPreset.pageTint || binder.pageTint || "#0f1d2f"),
    sleeveColor: hexSafe(fromMap.sleeveColor, fallbackPreset.sleeveColor || binder.sleeveColor || "#9cdfff"),
    patternStrength: clamp(Number(fromMap.patternStrength || fallbackPreset.patternStrength || 45), 8, 100),
    backgroundImage: cleanText(fromMap.backgroundImage),
    designTitle: cleanText(fromMap.designTitle),
    layoutPreset: legacyLayoutPreset,
    sceneImage: legacySceneImage,
    scenePanels: normalizeScenePanels(fromMap.scenePanels, {
      layoutPreset: legacyLayoutPreset,
      sceneImage: legacySceneImage,
      designTitle: cleanText(fromMap.designTitle),
    }),
    decorations: normalizeDecorations(fromMap.decorations),
  };
}

function upsertPageTheme(binder, page) {
  if (!binder.pageThemes || typeof binder.pageThemes !== "object") {
    binder.pageThemes = {};
  }
  const current = getPageTheme(binder, page);
  binder.pageThemes[String(page)] = {
    method: current.method,
    patternStyle: current.patternStyle,
    pageTint: current.pageTint,
    sleeveColor: current.sleeveColor,
    patternStrength: current.patternStrength,
    backgroundImage: current.backgroundImage,
    designTitle: current.designTitle,
    layoutPreset: current.layoutPreset,
    sceneImage: current.sceneImage,
    scenePanels: normalizeScenePanels(current.scenePanels, current),
    decorations: normalizeDecorations(current.decorations),
  };
  return binder.pageThemes[String(page)];
}

function getPageMethodLabel(method) {
  return PAGE_METHOD_PRESETS[method]?.label || "Custom";
}

function getPageLayout(theme) {
  return PAGE_LAYOUT_PRESETS[theme?.layoutPreset] || PAGE_LAYOUT_PRESETS.grid;
}

function matchesPanelTemplate(panel, template) {
  return Number(panel?.colSpan || 1) === Number(template?.colSpan || 1)
    && Number(panel?.rowSpan || 1) === Number(template?.rowSpan || 1);
}

function createScenePanelFromTemplate(template, theme = {}) {
  const base = {
    id: cryptoRandom(),
    anchor: clamp(Number(template?.anchor) || 1, 1, 9),
    colSpan: clamp(Number(template?.colSpan) || 1, 1, 3),
    rowSpan: clamp(Number(template?.rowSpan) || 1, 1, 3),
    title: cleanText(template?.title) || cleanText(theme.designTitle) || "Scene Art",
    image: "",
  };
  base.anchor = findNearestValidPanelAnchor(theme, null, base.anchor, base);
  return base;
}

function normalizeScenePanels(scenePanels, legacy = {}) {
  const list = Array.isArray(scenePanels) && scenePanels.length
    ? scenePanels
    : buildLegacyScenePanels(legacy);

  return list
    .map((panel, index) => normalizeScenePanel(panel, index))
    .filter(Boolean);
}

function buildLegacyScenePanels(legacy) {
  const preset = PAGE_LAYOUT_PRESETS[legacy.layoutPreset] || PAGE_LAYOUT_PRESETS.grid;
  if (!preset.panels.length) return [];
  return preset.panels.map((panel, index) => ({
    id: `legacy-panel-${index}`,
    anchor: panel.anchor,
    colSpan: panel.colSpan,
    rowSpan: panel.rowSpan,
    title: cleanText(legacy.designTitle) || panel.title || "Scene Art",
    image: cleanText(legacy.sceneImage),
  }));
}

function normalizeScenePanel(panel, index) {
  if (!panel || typeof panel !== "object") return null;
  const normalized = {
    id: cleanText(panel.id) || `panel-${index}-${Math.floor(Math.random() * 1e6)}`,
    anchor: clamp(Number(panel.anchor) || 1, 1, 9),
    colSpan: clamp(Number(panel.colSpan) || 1, 1, 3),
    rowSpan: clamp(Number(panel.rowSpan) || 1, 1, 3),
    title: cleanText(panel.title) || "Scene Art",
    image: cleanText(panel.image),
    zoom: clamp(Number(panel.zoom) || 100, 60, 260),
    focusX: clamp(Number(panel.focusX) || 50, 0, 100),
    focusY: clamp(Number(panel.focusY) || 50, 0, 100),
    layer: clamp(Number(panel.layer) || 12, 1, 40),
  };
  const covered = getPanelCoveredSlots(normalized);
  return covered.length ? normalized : null;
}

function isPanelPlacementValid(existingPanels, panel, panelIdToIgnore = null) {
  const covered = getPanelCoveredSlots(panel);
  if (covered.length !== Number(panel.colSpan || 1) * Number(panel.rowSpan || 1)) return false;
  const occupied = new Set();
  existingPanels.forEach((item) => {
    if (panelIdToIgnore && item.id === panelIdToIgnore) return;
    getPanelCoveredSlots(item).forEach((slot) => occupied.add(slot));
  });
  return covered.every((slot) => !occupied.has(slot));
}

function findNearestValidPanelAnchor(theme, panelId, preferredAnchor, template) {
  const existing = normalizeScenePanels(theme?.scenePanels, theme).filter((panel) => panel.id !== panelId);
  const preferred = clamp(Number(preferredAnchor) || 1, 1, 9);
  const candidates = Array.from({ length: 9 }, (_, index) => index + 1)
    .sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));

  for (const anchor of candidates) {
    const candidate = {
      ...template,
      anchor,
      colSpan: clamp(Number(template?.colSpan) || 1, 1, 3),
      rowSpan: clamp(Number(template?.rowSpan) || 1, 1, 3),
    };
    if (isPanelPlacementValid(existing, candidate)) {
      return anchor;
    }
  }

  return preferred;
}

function getPanelCoveredSlots(panel) {
  const covered = [];
  const anchor = Number(panel.anchor || 1);
  const startRow = Math.ceil(anchor / 3);
  const startCol = ((anchor - 1) % 3) + 1;
  for (let rowOffset = 0; rowOffset < Number(panel.rowSpan || 1); rowOffset += 1) {
    for (let colOffset = 0; colOffset < Number(panel.colSpan || 1); colOffset += 1) {
      const row = startRow + rowOffset;
      const col = startCol + colOffset;
      if (row < 1 || row > 3 || col < 1 || col > 3) continue;
      covered.push((row - 1) * 3 + col);
    }
  }
  return covered;
}

function getReservedSlotsForTheme(theme) {
  return new Set(normalizeScenePanels(theme?.scenePanels, theme).flatMap((panel) => getPanelCoveredSlots(panel)));
}

function getAvailableSlotsForTheme(theme) {
  const reserved = getReservedSlotsForTheme(theme);
  return Array.from({ length: 9 }, (_, index) => index + 1).filter((slot) => !reserved.has(slot));
}

function renderPageLayoutItem(grid, slotNumber, pageTheme) {
  const panel = pageTheme.scenePanels.find((item) => Number(item.anchor) === Number(slotNumber));
  if (!panel) return false;
  const scene = createScenePanelNode(pageTheme, panel, {
    mode: "collection",
    binderId: grid.dataset.binderId,
    page: Number(grid.dataset.page || 1),
  });
  grid.appendChild(scene);
  return true;
}

function buildScenePanelBackground(pageTheme, panel) {
  const layers = [getMethodOverlay(pageTheme.method)];
  if (panel?.image) {
    layers.push(`url(${panel.image})`);
  } else if (pageTheme.sceneImage) {
    layers.push(`url(${pageTheme.sceneImage})`);
  } else if (pageTheme.backgroundImage) {
    layers.push(`url(${pageTheme.backgroundImage})`);
  }
  layers.push("linear-gradient(160deg, rgba(255,255,255,0.08), rgba(0,0,0,0.12))");
  return layers.join(", ");
}

function createScenePanelNode(pageTheme, panel, options = {}) {
  const scene = document.createElement("div");
  scene.className = `page-scene-panel${options.mode === "book" ? " book" : ""}`;
  scene.dataset.panelId = panel.id;
  scene.dataset.anchor = String(panel.anchor);
  scene.style.gridColumn = `span ${Number(panel.colSpan || 1)}`;
  scene.style.gridRow = `span ${Number(panel.rowSpan || 1)}`;
  applyScenePanelBackgroundStyles(scene, pageTheme, panel);
  scene.style.zIndex = String(clamp(Number(panel.layer) || 12, 1, 40));
  scene.innerHTML = `
    <div class="page-scene-copy">
      <span class="page-scene-kicker">${escapeHtml(panel.title || "Scene Art")}</span>
      <strong>${escapeHtml(panel.title || pageTheme.designTitle || getPageMethodLabel(pageTheme.method))}</strong>
    </div>
  `;

  if (options.mode === "collection") {
    scene.classList.add("draggable-panel");
    scene.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      startCollectionScenePanelDrag(event, scene, options.binderId, options.page, panel.id);
    });
  }
  return scene;
}

function renderPageScenePanels(grid, pageTheme, options = {}) {
  [...pageTheme.scenePanels]
    .sort((a, b) => Number(a.layer || 0) - Number(b.layer || 0))
    .forEach((panel) => {
    const scene = createScenePanelNode(pageTheme, panel, options);
    grid.appendChild(scene);
    });
}

function renderPanelLayoutEditor(target, binder, page) {
  if (!target || !binder) return;
  const theme = getPageTheme(binder, page);
  target.innerHTML = "";

  for (let slot = 1; slot <= 9; slot += 1) {
    const cell = document.createElement("div");
    cell.className = "panel-layout-cell";
    cell.textContent = String(slot);
    target.appendChild(cell);
  }

  theme.scenePanels.forEach((panel) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "panel-layout-scene";
    node.dataset.panelId = panel.id;
    node.style.gridColumn = `${((panel.anchor - 1) % 3) + 1} / span ${panel.colSpan}`;
    node.style.gridRow = `${Math.ceil(panel.anchor / 3)} / span ${panel.rowSpan}`;
    applyScenePanelBackgroundStyles(node, theme, panel);
    node.style.zIndex = String(clamp(Number(panel.layer) || 12, 1, 40));
    node.innerHTML = `<span>${escapeHtml(panel.title || "Scene Art")}</span>`;
    node.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      startScenePanelDrag(event, target, binder.id, page, panel.id);
    });
    const resizeHandle = document.createElement("span");
    resizeHandle.className = "panel-resize-handle";
    resizeHandle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      startScenePanelResize(event, target, binder.id, page, panel.id);
    });
    node.appendChild(resizeHandle);
    target.appendChild(node);
  });
}

function applyScenePanelBackgroundStyles(node, pageTheme, panel) {
  const zoom = clamp(Number(panel?.zoom) || 100, 60, 260);
  const focusX = clamp(Number(panel?.focusX) || 50, 0, 100);
  const focusY = clamp(Number(panel?.focusY) || 50, 0, 100);
  const hasImageLayer = !!(cleanText(panel?.image) || cleanText(pageTheme?.sceneImage) || cleanText(pageTheme?.backgroundImage));

  node.style.backgroundImage = buildScenePanelBackground(pageTheme, panel);
  if (hasImageLayer) {
    node.style.backgroundSize = `cover, ${zoom}%, cover`;
    node.style.backgroundPosition = `center, ${focusX}% ${focusY}%, center`;
    node.style.backgroundRepeat = "no-repeat, no-repeat, no-repeat";
  } else {
    node.style.backgroundSize = "cover, cover";
    node.style.backgroundPosition = "center, center";
    node.style.backgroundRepeat = "no-repeat, no-repeat";
  }
}

function startScenePanelDrag(event, editor, binderId, page, panelId) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return;
  const theme = getPageTheme(binder, page);
  const panel = theme.scenePanels.find((item) => item.id === panelId);
  if (!panel) return;
  const pointerId = event.pointerId;
  const node = event.currentTarget;
  const rect = editor.getBoundingClientRect();
  runtime.panelDrag = { binderId, page, panelId, pointerId };
  node.setPointerCapture(pointerId);
  node.classList.add("dragging");

  const onMove = (moveEvent) => {
    if (!runtime.panelDrag || runtime.panelDrag.pointerId !== moveEvent.pointerId) return;
    const dx = moveEvent.clientX - event.clientX;
    const dy = moveEvent.clientY - event.clientY;
    node.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onEnd = (endEvent) => {
    if (!runtime.panelDrag || runtime.panelDrag.pointerId !== endEvent.pointerId) return;
    const anchor = anchorFromPoint(rect, endEvent.clientX, endEvent.clientY);
    moveScenePanelToAnchor(binderId, page, panelId, anchor);
    runtime.panelDrag = null;
    node.classList.remove("dragging");
    node.style.transform = "";
    node.releasePointerCapture(pointerId);
    node.removeEventListener("pointermove", onMove);
    node.removeEventListener("pointerup", onEnd);
    node.removeEventListener("pointercancel", onEnd);
  };

  node.addEventListener("pointermove", onMove);
  node.addEventListener("pointerup", onEnd);
  node.addEventListener("pointercancel", onEnd);
}

function anchorFromPoint(rect, clientX, clientY) {
  const col = clamp(Math.floor(((clientX - rect.left) / rect.width) * 3) + 1, 1, 3);
  const row = clamp(Math.floor(((clientY - rect.top) / rect.height) * 3) + 1, 1, 3);
  return (row - 1) * 3 + col;
}

function moveScenePanelToAnchor(binderId, page, panelId, preferredAnchor) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return;
  const theme = upsertPageTheme(binder, page);
  theme.scenePanels = theme.scenePanels.map((panel) => {
    if (panel.id !== panelId) return panel;
    return {
      ...panel,
      anchor: findNearestValidPanelAnchor(theme, panelId, preferredAnchor, panel),
    };
  });
  rebalancePageForLayout(binderId, page);
  persist();
  renderCollection();
  renderBinderManager();
}

function mutateScenePanel(binder, maxPages, themePageSelect, panelId, updater) {
  const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
  const theme = upsertPageTheme(binder, page);
  theme.scenePanels = theme.scenePanels.map((panel) => panel.id === panelId ? normalizeScenePanel(updater(panel), 0) || panel : panel);
  persist();
  renderCollection();
  renderBinderManager();
}

function startCollectionScenePanelDrag(event, node, binderId, page, panelId) {
  const grid = node.parentElement;
  if (!grid) return;
  const rect = grid.getBoundingClientRect();
  const pointerId = event.pointerId;
  runtime.panelDrag = { binderId, page, panelId, pointerId, source: "collection" };
  node.setPointerCapture(pointerId);
  node.classList.add("dragging");

  const onMove = (moveEvent) => {
    if (!runtime.panelDrag || runtime.panelDrag.pointerId !== moveEvent.pointerId) return;
    const dx = moveEvent.clientX - event.clientX;
    const dy = moveEvent.clientY - event.clientY;
    node.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onEnd = (endEvent) => {
    if (!runtime.panelDrag || runtime.panelDrag.pointerId !== endEvent.pointerId) return;
    const anchor = anchorFromPoint(rect, endEvent.clientX, endEvent.clientY);
    moveScenePanelToAnchor(binderId, page, panelId, anchor);
    runtime.panelDrag = null;
    node.classList.remove("dragging");
    node.style.transform = "";
    node.releasePointerCapture(pointerId);
    node.removeEventListener("pointermove", onMove);
    node.removeEventListener("pointerup", onEnd);
    node.removeEventListener("pointercancel", onEnd);
  };

  node.addEventListener("pointermove", onMove);
  node.addEventListener("pointerup", onEnd);
  node.addEventListener("pointercancel", onEnd);
}

function startScenePanelResize(event, editor, binderId, page, panelId) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return;
  const theme = getPageTheme(binder, page);
  const panel = theme.scenePanels.find((item) => item.id === panelId);
  if (!panel) return;
  const rect = editor.getBoundingClientRect();
  const pointerId = event.pointerId;
  const node = event.currentTarget.parentElement;
  if (!node) return;
  let nextColSpan = Number(panel.colSpan || 1);
  let nextRowSpan = Number(panel.rowSpan || 1);
  runtime.panelDrag = { binderId, page, panelId, pointerId, source: "resize" };
  node.setPointerCapture(pointerId);

  const onMove = (moveEvent) => {
    if (!runtime.panelDrag || runtime.panelDrag.pointerId !== moveEvent.pointerId) return;
    const col = clamp(Math.floor(((moveEvent.clientX - rect.left) / rect.width) * 3) + 1, 1, 3);
    const row = clamp(Math.floor(((moveEvent.clientY - rect.top) / rect.height) * 3) + 1, 1, 3);
    const startCol = ((panel.anchor - 1) % 3) + 1;
    const startRow = Math.ceil(panel.anchor / 3);
    const candidateColSpan = clamp(col - startCol + 1, 1, 3);
    const candidateRowSpan = clamp(row - startRow + 1, 1, 3);
    const candidate = { ...panel, colSpan: candidateColSpan, rowSpan: candidateRowSpan };
    if (!isPanelPlacementValid(theme.scenePanels, candidate, panelId)) return;
    nextColSpan = candidateColSpan;
    nextRowSpan = candidateRowSpan;
    node.parentElement.style.gridTemplateColumns = "repeat(3, 1fr)";
    node.style.gridColumn = `${((panel.anchor - 1) % 3) + 1} / span ${nextColSpan}`;
    node.style.gridRow = `${Math.ceil(panel.anchor / 3)} / span ${nextRowSpan}`;
  };

  const onEnd = (endEvent) => {
    if (!runtime.panelDrag || runtime.panelDrag.pointerId !== endEvent.pointerId) return;
    const liveBinder = state.binders.find((item) => item.id === binderId);
    if (liveBinder) {
      const liveTheme = upsertPageTheme(liveBinder, page);
      liveTheme.scenePanels = liveTheme.scenePanels.map((item) => item.id === panelId
        ? { ...item, colSpan: nextColSpan, rowSpan: nextRowSpan }
        : item);
      rebalancePageForLayout(binderId, page);
      persist();
      renderCollection();
      renderBinderManager();
    }
    runtime.panelDrag = null;
    node.releasePointerCapture(pointerId);
    node.removeEventListener("pointermove", onMove);
    node.removeEventListener("pointerup", onEnd);
    node.removeEventListener("pointercancel", onEnd);
  };

  node.addEventListener("pointermove", onMove);
  node.addEventListener("pointerup", onEnd);
  node.addEventListener("pointercancel", onEnd);
}

function applyPageThemeToGrid(grid, pageTheme, pageDoodle) {
  if (!grid) return;
  grid.style.backgroundColor = pageTheme.pageTint || "#0f1d2f";
  grid.style.backgroundImage = buildPageBackgroundImage(pageTheme, pageDoodle);
  grid.style.backgroundSize = pageTheme.backgroundImage
    ? "cover, cover, 220px 220px, 18px 18px"
    : "cover, 220px 220px, 18px 18px";
  grid.style.backgroundPosition = pageTheme.backgroundImage
    ? "center, center, center, center"
    : "center, center, center";
  grid.style.backgroundRepeat = pageTheme.backgroundImage
    ? "no-repeat, no-repeat, repeat, repeat"
    : "no-repeat, repeat, repeat";
  grid.style.setProperty("--page-rim", pageTheme.sleeveColor || "#9cdfff");
  grid.style.setProperty("--page-glow", getMethodGlow(pageTheme.method, pageTheme.sleeveColor));
}

function buildPageBackgroundImage(pageTheme, pageDoodle) {
  const layers = [getMethodOverlay(pageTheme.method)];
  if (pageTheme.backgroundImage) {
    layers.push(`url(${pageTheme.backgroundImage})`);
  }
  layers.push(`url(${pageDoodle})`);
  layers.push("radial-gradient(circle at center, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px)");
  return layers.join(", ");
}

function getMethodOverlay(method) {
  const overlays = {
    classic: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.08))",
    michi: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(110,255,212,0.12) 34%, rgba(243,165,255,0.18) 72%, rgba(9,15,28,0.2))",
    minimal: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
    energy: "linear-gradient(125deg, rgba(255,185,92,0.22), rgba(255,103,136,0.12) 40%, rgba(20,8,14,0.24))",
  };
  return overlays[method] || overlays.classic;
}

function getMethodGlow(method, sleeveColor) {
  const alpha = method === "michi" ? "44" : method === "energy" ? "36" : method === "minimal" ? "18" : "26";
  return `${hexSafe(sleeveColor, "#9cdfff")}${alpha}`;
}

function buildPagePreviewBackground(pageTheme) {
  const doodle = getPageDoodlePattern(pageTheme.patternStyle || "ocean", 1, pageTheme.patternStrength || 45);
  const layers = [getMethodOverlay(pageTheme.method)];
  if (pageTheme.backgroundImage) {
    layers.push(`url(${pageTheme.backgroundImage})`);
  }
  layers.push(`url(${doodle})`);
  return layers.join(", ");
}

function renderPageDecorations(grid, binder, page) {
  if (!grid) return;
  grid.querySelector(".page-decoration-layer")?.remove();
  const theme = getPageTheme(binder, page);
  if (!Array.isArray(theme.decorations) || !theme.decorations.length) return;

  const layer = document.createElement("div");
  layer.className = "page-decoration-layer";

  theme.decorations.forEach((decoration) => {
    const preset = STICKER_PRESETS[decoration.kind] || STICKER_PRESETS.star;
    const sticker = document.createElement("button");
    sticker.type = "button";
    sticker.className = "page-decoration";
    sticker.dataset.decorationId = decoration.id;
    sticker.style.left = `${clamp(Number(decoration.x) || 50, 0, 100)}%`;
    sticker.style.top = `${clamp(Number(decoration.y) || 50, 0, 100)}%`;
    sticker.style.width = `${clamp(Number(decoration.size) || 18, 8, 42)}%`;
    sticker.style.opacity = String(clamp(Number(decoration.opacity) || 0.95, 0.2, 1));
    sticker.style.zIndex = String(clamp(Number(decoration.layer) || 20, 1, 40));
    sticker.style.transform = `translate(-50%, -50%) rotate(${clamp(Number(decoration.rotation) || 0, -180, 180)}deg)`;
    sticker.innerHTML = `
      <img src="${createStickerDataUrl(preset, decoration.color)}" alt="${escapeAttr(preset.label)} sticker" draggable="false" />
    `;

    sticker.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      startDecorationDrag(event, sticker, binder.id, page, decoration.id);
    });

    layer.appendChild(sticker);
  });

  grid.appendChild(layer);
}

function normalizeDecorations(decorations) {
  if (!Array.isArray(decorations)) return [];
  return decorations
    .map((item, index) => ({
      id: cleanText(item?.id) || `decor-${index}-${Math.floor(Math.random() * 1e6)}`,
      kind: cleanText(item?.kind) || "star",
      x: clamp(Number(item?.x) || 50, 0, 100),
      y: clamp(Number(item?.y) || 50, 0, 100),
      size: clamp(Number(item?.size) || 18, 8, 42),
      rotation: clamp(Number(item?.rotation) || 0, -180, 180),
      opacity: clamp(Number(item?.opacity) || 0.95, 0.2, 1),
      layer: clamp(Number(item?.layer) || 20, 1, 40),
      color: cleanText(item?.color) || "",
    }))
    .filter((item) => STICKER_PRESETS[item.kind]);
}

function createStickerDataUrl(preset, overrideFill = "") {
  const fill = hexSafe(overrideFill, preset.fill);
  const stroke = preset.stroke;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <path d='${preset.path}' fill='${fill}' stroke='${stroke}' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function startDecorationDrag(event, sticker, binderId, page, decorationId) {
  const layer = sticker.parentElement;
  if (!layer) return;
  const rect = layer.getBoundingClientRect();
  const pointerId = event.pointerId;
  runtime.decorationDrag = { binderId, page, decorationId, pointerId };
  sticker.setPointerCapture(pointerId);

  const onMove = (moveEvent) => {
    if (!runtime.decorationDrag || runtime.decorationDrag.pointerId !== moveEvent.pointerId) return;
    const x = clamp(((moveEvent.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((moveEvent.clientY - rect.top) / rect.height) * 100, 0, 100);
    updateDecorationPosition(binderId, page, decorationId, x, y, false);
    sticker.style.left = `${x}%`;
    sticker.style.top = `${y}%`;
  };

  const onEnd = (endEvent) => {
    if (!runtime.decorationDrag || runtime.decorationDrag.pointerId !== endEvent.pointerId) return;
    const x = clamp(((endEvent.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((endEvent.clientY - rect.top) / rect.height) * 100, 0, 100);
    updateDecorationPosition(binderId, page, decorationId, x, y, true);
    runtime.decorationDrag = null;
    sticker.releasePointerCapture(pointerId);
    sticker.removeEventListener("pointermove", onMove);
    sticker.removeEventListener("pointerup", onEnd);
    sticker.removeEventListener("pointercancel", onEnd);
  };

  sticker.addEventListener("pointermove", onMove);
  sticker.addEventListener("pointerup", onEnd);
  sticker.addEventListener("pointercancel", onEnd);
}

function updateDecorationPosition(binderId, page, decorationId, x, y, shouldPersist) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return;
  const theme = upsertPageTheme(binder, page);
  theme.decorations = normalizeDecorations(theme.decorations).map((item) => {
    if (item.id !== decorationId) return item;
    return { ...item, x, y };
  });
  if (shouldPersist) {
    persist();
    renderCollection();
  }
}

function getAverageDecorationSize(decorations) {
  const list = normalizeDecorations(decorations);
  if (!list.length) return 18;
  return list.reduce((sum, item) => sum + Number(item.size || 18), 0) / list.length;
}

function getPageDoodlePattern(style, page, strength = 45) {
  const safeStrength = clamp(Number(strength || 45), 8, 100);
  const key = `${style}:${page}:${safeStrength}`;
  if (runtime.pageDoodles[key]) return runtime.pageDoodles[key];

  const palette = {
    ocean: ["#7fdcff", "#6effd4"],
    lava: ["#ffb36a", "#ff788f"],
    moss: ["#8ff4af", "#5fd3c8"],
    static: ["#ffe883", "#84bfff"],
    prism: ["#f3a5ff", "#8de9ff"],
  };
  const [a, b] = palette[style] || palette.ocean;
  const shift = (Number(page || 1) * 7) % 22;
  const strokeOpacity = (0.08 + safeStrength / 500).toFixed(3);
  const fillOpacity = (0.06 + safeStrength / 420).toFixed(3);
  const strokeWidth = (1 + safeStrength / 70).toFixed(2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'>
    <g fill='none' stroke='${a}' stroke-opacity='${strokeOpacity}' stroke-width='${strokeWidth}'>
      <circle cx='40' cy='42' r='12'/>
      <circle cx='178' cy='74' r='16'/>
      <path d='M20 ${130 + shift}c18-10 42-9 57 1s34 9 48 0 31-10 45-1'/>
    </g>
    <g fill='${b}' fill-opacity='${fillOpacity}'>
      <polygon points='102,25 110,42 129,45 115,58 118,77 102,68 86,77 89,58 75,45 94,42'/>
      <rect x='152' y='152' width='22' height='22' rx='4' transform='rotate(17 163 163)'/>
      <circle cx='58' cy='170' r='8'/>
    </g>
  </svg>`;

  runtime.pageDoodles[key] = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return runtime.pageDoodles[key];
}

function renderCardItem(card, context) {
  const node = els.cardItemTemplate.content.firstElementChild.cloneNode(true);

  const binder = state.binders.find((b) => b.id === card.binderId);
  const thumb = node.querySelector(".thumb");
  const nm = node.querySelector(".nm");
  const meta = node.querySelector(".meta");
  const chip = node.querySelector(".grade-chip");
  const tags = node.querySelector(".card-tags");
  const del = node.querySelector(".delete-card");
  const moveSelect = node.querySelector(".move-page-select");
  const moveBtn = node.querySelector(".move-page");
  const editBtn = node.querySelector(".edit-slot");
  const chartWrap = node.querySelector(".card-chart-wrap");

  thumb.src = card.image;
  nm.textContent = card.name;
  meta.textContent = [card.set, card.number && `#${card.number}`].filter(Boolean).join(" · ");
  chip.textContent = `EST ${card.grade.toFixed(1)}`;

  addTag(tags, card.rarity || "Unknown rarity");
  if (card.hp) addTag(tags, `${card.hp} HP`);
  if (Array.isArray(card.types) && card.types.length) addTag(tags, card.types.join("/"));
  if (card.artist) addTag(tags, `Art: ${card.artist}`);
  addTag(tags, binder?.name || "No binder");
  addTag(tags, `Page ${card.page || 1}`);
  if (card.purchasePrice != null) {
    addTag(tags, `Paid $${card.purchasePrice.toFixed(2)}`);
  }

  chartWrap.innerHTML = renderSparklineSvg(getCardHistorySeries(card), money(card.rawValue || 0));

  const totalPages = Number(context?.totalPages || 1);
  moveSelect.innerHTML = Array.from({ length: totalPages }, (_, i) => {
    const p = i + 1;
    return `<option value="${p}" ${p === Number(card.page || 1) ? "selected" : ""}>Page ${p}</option>`;
  }).join("");

  moveBtn.addEventListener("click", () => {
    const targetPage = clamp(Number(moveSelect.value) || 1, 1, totalPages);
    const currentPage = Number(card.page || 1);
    if (targetPage === currentPage) return;

    if (countCardsInPage(card.binderId, targetPage) >= getPageCapacity(card.binderId, targetPage)) {
      status(`Page ${targetPage} is full. Move a card out first.`);
      return;
    }

    state.cards = state.cards.map((c) => {
      if (c.id !== card.id) return c;
      return {
        ...c,
        page: targetPage,
        slotOrder: getNextSlotOrder(card.binderId, targetPage),
      };
    });

    persist();
    renderCollection();
    status(`${card.name} moved to page ${targetPage}.`);
  });

  editBtn.addEventListener("click", () => {
    openBinderEditor(card.binderId, Number(card.page || 1), card.id);
  });

  if (context?.dndEnabled) {
    node.setAttribute("draggable", "true");
    node.classList.add("draggable");

    node.addEventListener("dragstart", () => {
      runtime.dragCardId = card.id;
      node.classList.add("dragging");
    });

    node.addEventListener("dragend", () => {
      runtime.dragCardId = null;
      node.classList.remove("dragging");
    });

    node.addEventListener("dragover", (event) => {
      event.preventDefault();
      node.classList.add("drag-over");
    });

    node.addEventListener("dragleave", () => {
      node.classList.remove("drag-over");
    });

    node.addEventListener("drop", (event) => {
      event.preventDefault();
      node.classList.remove("drag-over");
      if (!runtime.dragCardId || runtime.dragCardId === card.id) return;
      reorderCardsInPage(context.binderId, Number(context.page), runtime.dragCardId, card.id);
      runtime.dragCardId = null;
    });
  }

  del.addEventListener("click", () => {
    const ok = window.confirm(`Remove ${card.name} from your collection?`);
    if (!ok) return;
    state.cards = state.cards.filter((c) => c.id !== card.id);
    persist();
    renderCollection();
    renderBinderManager();
  });

  return node;
}

function renderBinderEditor() {
  if (!els.binderEditor) return;
  if (!runtime.editor.open) {
    els.binderEditor.classList.add("hidden");
    return;
  }

  const binderId = runtime.editor.binderId || state.binders[0]?.id;
  const binder = state.binders.find((item) => item.id === binderId) || state.binders[0];
  if (!binder) {
    closeBinderEditor();
    return;
  }

  runtime.editor.binderId = binder.id;
  runtime.editor.page = clamp(Number(runtime.editor.page || 1), 1, Number(binder.pages || 1));
  const page = runtime.editor.page;
  const binderCards = sortCardsForPage(state.cards.filter((card) => card.binderId === binder.id), "binder");
  const pageCards = binderCards.filter((card) => Number(card.page || 1) === page);
  const selectedCard = binderCards.find((card) => card.id === runtime.editor.selectedCardId) || null;

  els.binderEditor.classList.remove("hidden");
  els.editorBinderSelect.innerHTML = state.binders.map((item) => `<option value="${item.id}" ${item.id === binder.id ? "selected" : ""}>${escapeHtml(item.coverTitle || item.name)}</option>`).join("");
  els.editorPageSelect.innerHTML = Array.from({ length: Number(binder.pages || 1) }, (_, index) => {
    const value = index + 1;
    return `<option value="${value}" ${value === page ? "selected" : ""}>Page ${value}</option>`;
  }).join("");
  els.binderEditorMeta.textContent = `${binderCards.length} cards in ${binder.coverTitle || binder.name}. Tap a card, then tap a slot.`;
  els.editorSelectedCard.innerHTML = selectedCard
    ? `Selected: <strong>${escapeHtml(selectedCard.name)}</strong> from page ${Number(selectedCard.page || 1)} slot ${Number(selectedCard.slotOrder || 0) || "-"}`
    : "No card selected.";

  els.editorCardPicker.innerHTML = binderCards.map((card) => `
    <button class="picker-card${card.id === runtime.editor.selectedCardId ? " active" : ""}" type="button" data-card-id="${card.id}">
      <strong>${escapeHtml(card.name)}</strong>
      <span>Page ${Number(card.page || 1)} · Slot ${Number(card.slotOrder || 0) || "-"}</span>
    </button>
  `).join("");
  els.editorCardPicker.querySelectorAll(".picker-card").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.editor.selectedCardId = button.dataset.cardId;
      renderBinderEditor();
    });
  });

  els.editorSlotGrid.innerHTML = "";
  const pageTheme = getPageTheme(binder, page);
  const reservedSlots = getReservedSlotsForTheme(pageTheme);
  for (let slotNumber = 1; slotNumber <= 9; slotNumber += 1) {
    if (renderPageLayoutItem(els.editorSlotGrid, slotNumber, pageTheme)) {
      continue;
    }
    if (reservedSlots.has(slotNumber)) {
      continue;
    }
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "editor-slot";
    const slotCard = pageCards.find((card) => Number(card.slotOrder || 0) === slotNumber);
    if (runtime.editor.selectedCardId) slot.classList.add("selected-target");
    slot.innerHTML = `
      <span class="editor-slot-label">Slot ${slotNumber}</span>
      ${slotCard ? `<img src="${slotCard.image}" alt="${escapeAttr(slotCard.name)}" />` : ""}
      <span class="editor-slot-name">${escapeHtml(slotCard?.name || "Empty slot")}</span>
    `;
    slot.addEventListener("click", () => {
      if (!runtime.editor.selectedCardId) {
        status("Select a card first in the editor.");
        return;
      }
      placeCardInSlot(runtime.editor.selectedCardId, binder.id, page, slotNumber);
      runtime.editor.selectedCardId = null;
      renderBinderEditor();
    });
    els.editorSlotGrid.appendChild(slot);
  }
}

function addTag(parent, text) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = text;
  parent.appendChild(tag);
}

function renderSummary() {
  const total = state.cards.length;
  const avgGrade = total ? state.cards.reduce((s, c) => s + c.grade, 0) / total : 0;
  const invested = state.cards.filter((c) => c.purchasePrice != null);
  const rawTotal = state.cards.reduce((sum, c) => sum + Number(c.rawValue || 0), 0);
  const gradedTotal = state.cards.reduce((sum, c) => sum + getEstimatedGradedValue(c), 0);
  const totalPL = invested.reduce((sum, c) => sum + (Number(c.rawValue || 0) - Number(c.purchasePrice || 0)), 0);

  els.collectionSummary.innerHTML = `
    <div><span>Total Cards</span><strong>${total}</strong></div>
    <div><span>Average Grade</span><strong>${total ? avgGrade.toFixed(2) : "-"}</strong></div>
    <div><span>Raw Value</span><strong>${money(rawTotal)}</strong></div>
    <div><span>Graded Value</span><strong>${money(gradedTotal)}</strong></div>
    <div><span>P / L</span><strong>${invested.length ? money(totalPL) : "-"}</strong></div>
    <div><span>Tracked Cards</span><strong>${invested.length}</strong></div>
  `;
}

function openBinderEditor(binderId, page = 1, selectedCardId = null) {
  runtime.editor.open = true;
  runtime.editor.binderId = binderId;
  runtime.editor.page = Number(page) || 1;
  runtime.editor.selectedCardId = selectedCardId;
  renderBinderEditor();
}

function closeBinderEditor() {
  runtime.editor.open = false;
  runtime.editor.binderId = null;
  runtime.editor.page = 1;
  runtime.editor.selectedCardId = null;
  renderBinderEditor();
}

function exportBackup() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state: {
      cards: state.cards,
      binders: state.binders,
      profile: state.profile,
      activeTheme: state.activeTheme,
      activeTab: state.activeTab,
      news: state.news,
      newsFetchedAt: state.newsFetchedAt,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `holograde-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  status("Backup exported.");
}

async function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const next = parsed.state || parsed;
    if (!Array.isArray(next.cards) || !Array.isArray(next.binders)) {
      throw new Error("Backup file is missing cards or binders.");
    }
    state.cards = next.cards;
    state.binders = next.binders;
    state.profile = typeof next.profile === "object" && next.profile ? {
      name: cleanText(next.profile.name) || "Collector",
      favorite: cleanText(next.profile.favorite),
      bio: cleanText(next.profile.bio),
    } : state.profile;
    state.activeTheme = APP_THEMES.includes(next.activeTheme) ? next.activeTheme : state.activeTheme;
    state.activeTab = cleanText(next.activeTab) || "dashboard";
    state.news = Array.isArray(next.news) ? next.news : [];
    state.newsFetchedAt = Number(next.newsFetchedAt) || 0;
    normalizePagingState();
    applyTheme(state.activeTheme);
    refreshBinderSelects();
    renderPortfolio();
    renderDashboard();
    renderCollection();
    renderBinderManager();
    setTab(state.activeTab);
    persist();
    status("Backup imported.");
  } catch (error) {
    status(error.message || "Could not import backup.");
  } finally {
    event.target.value = "";
  }
}

function renderSparklineSvg(values, label) {
  const points = values.length ? values : [0, 0, 0, 0, 0, 0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 280;
  const height = 64;
  const coords = points.map((value, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * (width - 8) + 4;
    const y = height - 10 - ((value - min) / range) * (height - 24);
    return [x, y];
  });
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const area = `${line} L ${coords[coords.length - 1][0]} ${height - 8} L ${coords[0][0]} ${height - 8} Z`;
  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <path class="area" d="${area}"></path>
      <path class="line" d="${line}"></path>
      <text x="6" y="12">6M sold trend</text>
      <text x="${width - 6}" y="12" text-anchor="end">${escapeHtml(label)}</text>
    </svg>
  `;
}

function getCardHistorySeries(card) {
  const seed = hashCode(`${card.id}:${card.name}`);
  const current = Number(card.rawValue || 0) || 1;
  return generateHistorySeries(current, seed, 6);
}

function getBinderHistorySeries(binderId) {
  const cards = state.cards.filter((card) => card.binderId === binderId);
  const current = cards.reduce((sum, card) => sum + Number(card.rawValue || 0), 0) || 1;
  return generateHistorySeries(current, hashCode(binderId), 6);
}

function generateHistorySeries(current, seed, length) {
  const values = [];
  for (let index = 0; index < length; index += 1) {
    const factor = pseudo(seed + index) * 0.34 - 0.17;
    const ageWeight = (length - index) / length;
    values.push(roundMoney(current * (1 - factor * ageWeight)));
  }
  values[length - 1] = roundMoney(current);
  return values;
}

function pseudo(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function hashCode(value) {
  return String(value || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 1;
}

function renderDashboard() {
  const latest = [...state.cards].sort((a, b) => b.addedAt - a.addedAt)[0];
  const topBinder = state.binders
    .map((binder) => ({
      binder,
      raw: state.cards.filter((c) => c.binderId === binder.id).reduce((sum, c) => sum + Number(c.rawValue || 0), 0),
      count: state.cards.filter((c) => c.binderId === binder.id).length,
    }))
    .sort((a, b) => b.raw - a.raw)[0];
  const rawTotal = state.cards.reduce((sum, c) => sum + Number(c.rawValue || 0), 0);
  const gradedTotal = state.cards.reduce((sum, c) => sum + getEstimatedGradedValue(c), 0);

  els.dashboardSummary.innerHTML = `
    <div><span>Total Cards</span><strong>${state.cards.length}</strong></div>
    <div><span>Raw Value</span><strong>${money(rawTotal)}</strong></div>
    <div><span>Graded Value</span><strong>${money(gradedTotal)}</strong></div>
  `;

  const spotlightLines = [
    latest ? `Latest add: ${latest.name} into ${getBinderLabel(latest.binderId)} on page ${latest.page || 1}.` : "Scan your first card to start the collection.",
    topBinder && topBinder.count ? `Top binder: ${topBinder.binder.coverTitle || topBinder.binder.name} with ${topBinder.count} cards and ${money(topBinder.raw)} raw value.` : "Create binders to organize your collection.",
    state.news.length ? `Latest headline: ${state.news[0].title}` : "News feed will show recent Pokemon TCG headlines here.",
  ];
  els.dashboardSpotlight.innerHTML = `<p>${spotlightLines.map((line) => escapeHtml(line)).join("<br />")}</p>`;
  renderNewsFeed();
}

function renderNewsFeed() {
  if (!els.newsFeed) return;
  els.newsFeed.innerHTML = "";

  if (!state.news.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No news available right now. Use refresh to try again.";
    els.newsFeed.appendChild(empty);
    return;
  }

  state.news.forEach((item) => {
    const node = els.newsItemTemplate.content.firstElementChild.cloneNode(true);
    const imageLink = node.querySelector(".news-image-link");
    const image = node.querySelector(".news-image");
    const titleLink = node.querySelector(".news-title-link");
    const meta = node.querySelector(".news-meta");
    const summary = node.querySelector(".news-summary");

    imageLink.href = item.link;
    titleLink.href = item.link;
    titleLink.textContent = item.title;
    image.src = item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/300`;
    image.alt = item.title;
    meta.textContent = [item.source, item.pubDate].filter(Boolean).join(" · ");
    summary.textContent = item.summary;

    els.newsFeed.appendChild(node);
  });
}

async function maybeRefreshNews() {
  if (!state.news.length || Date.now() - Number(state.newsFetchedAt || 0) > NEWS_CACHE_AGE_MS) {
    await fetchNews(false);
  } else {
    updateNewsStatus();
    renderDashboard();
  }
}

async function fetchNews(force) {
  if (!els.newsStatus) return;
  els.newsStatus.textContent = "Refreshing";
  state.news = buildCuratedNewsItems();
  state.newsFetchedAt = Date.now();
  persist();
  els.newsStatus.textContent = force ? "Curated" : "Ready";
  renderDashboard();
}

function updateNewsStatus() {
  const age = state.newsFetchedAt ? Math.max(1, Math.round((Date.now() - state.newsFetchedAt) / 60000)) : 0;
  els.newsStatus.textContent = state.newsFetchedAt ? `${age}m ago` : "Ready";
}

function wireBinders() {
  els.newBinderBtn.addEventListener("click", () => {
    const name = window.prompt("New binder name:");
    if (!name) return;
    const clean = cleanText(name);
    if (!clean) return;

    if (state.binders.some((b) => b.name.toLowerCase() === clean.toLowerCase())) {
      status("A binder with that name already exists.");
      return;
    }

    state.binders.push(defaultBinder(clean));
    persist();
    refreshBinderSelects();
    renderCollection();
    renderBinderManager();
    status(`Created binder: ${clean}`);
  });
}

function renderBinderManager() {
  els.binderManager.innerHTML = "";

  state.binders.forEach((binder) => {
    const wrap = document.createElement("section");
    wrap.className = "binder-config";

    const [c1, c2] = BINDER_STYLES[binder.style] || BINDER_STYLES.ocean;
    const coverTitle = binder.coverTitle || binder.name;
    const coverA = binder.coverColorA || c1;
    const coverB = binder.coverColorB || c2;
    const sleeve = binder.sleeveColor || "#9cdfff";
    const pageTint = binder.pageTint || "#0f1d2f";
    const coverScale = clamp(Number(binder.coverImageScale) || 100, 70, 220);
    const coverFocusX = clamp(Number(binder.coverImageFocusX) || 50, 0, 100);
    const coverFocusY = clamp(Number(binder.coverImageFocusY) || 50, 0, 100);
    const maxPages = Math.max(1, Number(binder.pages) || 1);
    const customPage = clamp(Number(runtime.viewPageByBinder[binder.id] || 1), 1, maxPages);
    const customTheme = getPageTheme(binder, customPage);
    const methodOptions = Object.entries(PAGE_METHOD_PRESETS)
      .map(([key, preset]) => `<option value="${key}" ${key === customTheme.method ? "selected" : ""}>${escapeHtml(preset.label)}</option>`)
      .join("");
    const pageOptions = Array.from({ length: maxPages }, (_, i) => {
      const page = i + 1;
      return `<option value="${page}" ${page === customPage ? "selected" : ""}>Page ${page}</option>`;
    }).join("");
    const layoutOptions = Object.entries(PAGE_LAYOUT_PRESETS)
      .map(([key, preset]) => `<option value="${key}" ${key === customTheme.layoutPreset ? "selected" : ""}>${escapeHtml(preset.label)}</option>`)
      .join("");
    const panelButtons = Object.entries(SCENE_PANEL_TEMPLATES)
      .map(([key, template]) => `<button class="btn ghost small" type="button" data-action="add-panel" data-panel-template="${key}">${escapeHtml(template.label)}</button>`)
      .join("");
    const panelCards = customTheme.scenePanels.map((panel, index) => `
      <div class="panel-config-card" data-panel-id="${panel.id}">
        <div class="panel-config-head">
          <strong>Panel ${index + 1}</strong>
          <button class="btn ghost small" type="button" data-action="remove-panel" data-panel-id="${panel.id}">Remove</button>
        </div>
        <label>
          Panel title
          <input type="text" value="${escapeAttr(panel.title || "")}" data-action="panel-title" data-panel-id="${panel.id}" />
        </label>
        <label>
          Panel shape
          <select data-action="panel-shape" data-panel-id="${panel.id}">
            ${Object.entries(SCENE_PANEL_TEMPLATES)
              .map(([key, template]) => `<option value="${key}" ${matchesPanelTemplate(panel, template) ? "selected" : ""}>${escapeHtml(template.label)}</option>`)
              .join("")}
          </select>
        </label>
        <div class="panel-span-grid">
          <label>
            Width (cards)
            <select data-action="panel-width" data-panel-id="${panel.id}">
              ${[1, 2, 3].map((value) => `<option value="${value}" ${Number(panel.colSpan || 1) === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <label>
            Height (cards)
            <select data-action="panel-height" data-panel-id="${panel.id}">
              ${[1, 2, 3].map((value) => `<option value="${value}" ${Number(panel.rowSpan || 1) === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
        </div>
        <label>
          Panel art
          <input type="file" accept="image/*" data-action="panel-image" data-panel-id="${panel.id}" />
        </label>
        <label>
          Layer (${Number(panel.layer || 12)})
          <input type="range" min="1" max="40" step="1" value="${Number(panel.layer || 12)}" data-action="panel-layer" data-panel-id="${panel.id}" />
        </label>
        <label>
          Zoom (${Number(panel.zoom || 100)}%)
          <input type="range" min="60" max="260" step="5" value="${Number(panel.zoom || 100)}" data-action="panel-zoom" data-panel-id="${panel.id}" />
        </label>
        <label>
          Focus X (${Number(panel.focusX || 50)}%)
          <input type="range" min="0" max="100" step="1" value="${Number(panel.focusX || 50)}" data-action="panel-focus-x" data-panel-id="${panel.id}" />
        </label>
        <label>
          Focus Y (${Number(panel.focusY || 50)}%)
          <input type="range" min="0" max="100" step="1" value="${Number(panel.focusY || 50)}" data-action="panel-focus-y" data-panel-id="${panel.id}" />
        </label>
        <div class="panel-layer-actions">
          <button class="btn ghost small" type="button" data-action="panel-back" data-panel-id="${panel.id}">Send Back</button>
          <button class="btn ghost small" type="button" data-action="panel-front" data-panel-id="${panel.id}">Bring Front</button>
        </div>
      </div>
    `).join("");
    const stickerButtons = Object.entries(STICKER_PRESETS)
      .map(([key, preset]) => `
        <button class="sticker-preset" type="button" data-action="add-sticker" data-sticker="${key}">
          <img src="${createStickerDataUrl(preset)}" alt="${escapeAttr(preset.label)}" />
          <span>${escapeHtml(preset.label)}</span>
        </button>
      `)
      .join("");

    wrap.innerHTML = `
      <h4>${escapeHtml(binder.name)}</h4>
      <div class="config-grid">
        <label>
          Rename binder
          <input type="text" value="${escapeAttr(binder.name)}" data-action="rename" />
        </label>
        <label>
          Sleeve style
          <select data-action="style">
            ${Object.keys(BINDER_STYLES)
              .map((style) => `<option value="${style}" ${style === binder.style ? "selected" : ""}>${titleCase(style)}</option>`)
              .join("")}
          </select>
        </label>
        <button class="btn ghost small" data-action="delete" type="button">Delete</button>
      </div>

      <div class="sub-grid">
        <label>
          Cover title
          <input type="text" value="${escapeAttr(coverTitle)}" data-action="cover-title" />
        </label>
        <label>
          Cover image
          <input type="file" accept="image/*" data-action="cover-image" />
        </label>
        <label>
          Page tint color
          <input type="color" value="${escapeAttr(hexSafe(pageTint, "#0f1d2f"))}" data-action="page-tint" />
        </label>
        <label>
          Cover color A
          <input type="color" value="${escapeAttr(hexSafe(coverA, "#58d0ff"))}" data-action="cover-a" />
        </label>
        <label>
          Cover color B
          <input type="color" value="${escapeAttr(hexSafe(coverB, "#6effd4"))}" data-action="cover-b" />
        </label>
        <label>
          Sleeve border
          <input type="color" value="${escapeAttr(hexSafe(sleeve, "#9cdfff"))}" data-action="sleeve" />
        </label>
        <label>
          Cover zoom (${coverScale}%)
          <input type="range" min="70" max="220" step="1" value="${coverScale}" data-action="cover-scale" />
        </label>
        <label>
          Cover focus X (${coverFocusX}%)
          <input type="range" min="0" max="100" step="1" value="${coverFocusX}" data-action="cover-focus-x" />
        </label>
        <label>
          Cover focus Y (${coverFocusY}%)
          <input type="range" min="0" max="100" step="1" value="${coverFocusY}" data-action="cover-focus-y" />
        </label>
        <button class="btn ghost small" data-action="clear-cover" type="button">Clear Cover Image</button>
      </div>

      <div class="cover-preview" style="background-image:${binder.coverImage ? `linear-gradient(rgba(3,12,22,.28), rgba(3,12,22,.55)), url(${binder.coverImage})` : `linear-gradient(120deg, ${coverA}, ${coverB})`}; background-size:${binder.coverImage ? `${coverScale}%, ${coverScale}%` : "cover"}; background-position:${binder.coverImage ? `${coverFocusX}% ${coverFocusY}%, ${coverFocusX}% ${coverFocusY}%` : "center"};">${escapeHtml(coverTitle)}</div>
      <div class="sleeve-preview" style="border-color:${sleeve}; background-color:${pageTint};"></div>

      <div class="michi-page-lab">
        <h5>Michi Method Page Lab</h5>
        <div class="sub-grid">
          <label>
            Target page
            <select data-action="theme-page">${pageOptions}</select>
          </label>
          <label>
            Method preset
            <select data-action="theme-method">${methodOptions}</select>
          </label>
          <label>
            Page tint
            <input type="color" value="${escapeAttr(hexSafe(customTheme.pageTint, pageTint))}" data-action="theme-tint" />
          </label>
          <label>
            Sleeve tint
            <input type="color" value="${escapeAttr(hexSafe(customTheme.sleeveColor, sleeve))}" data-action="theme-sleeve" />
          </label>
          <label>
            Pattern style
            <select data-action="theme-pattern">
              ${Object.keys(BINDER_STYLES)
                .map((style) => `<option value="${style}" ${style === customTheme.patternStyle ? "selected" : ""}>${titleCase(style)}</option>`)
                .join("")}
            </select>
          </label>
          <label>
            Pattern strength (${Number(customTheme.patternStrength || 45)})
            <input type="range" min="8" max="100" step="1" value="${Number(customTheme.patternStrength || 45)}" data-action="theme-strength" />
          </label>
          <label>
            Page art image
            <input type="file" accept="image/*" data-action="theme-image" />
          </label>
          <label>
            Design title
            <input type="text" value="${escapeAttr(customTheme.designTitle || "")}" data-action="theme-title" placeholder="e.g. Neon Sakura" />
          </label>
          <label>
            Scene panel art
            <input type="file" accept="image/*" data-action="theme-scene-image" />
          </label>
        </div>
        <div class="page-style-preview" style="background-image:${buildPagePreviewBackground(customTheme)}">
          <span>${escapeHtml(customTheme.designTitle || `${getPageMethodLabel(customTheme.method)} Page ${customPage}`)}</span>
        </div>
        <div class="michi-lab-note muted">Add panels, drag them on the preview grid, and resize them to claim more card spaces.</div>
        <div class="panel-template-actions">${panelButtons}</div>
        <div class="panel-layout-editor" data-binder-id="${binder.id}" data-page="${customPage}"></div>
        <div class="panel-config-list">${panelCards || '<p class="muted">No scene panels yet. Add one and drag it on the preview grid.</p>'}</div>
        <div class="michi-lab-note muted">Stickers sit above the page art and can be dragged in the live binder page.</div>
        <div class="sticker-preset-grid">${stickerButtons}</div>
        <div class="sub-grid compact-controls">
          <label>
            Sticker scale (${Math.round(getAverageDecorationSize(customTheme.decorations) || 18)}%)
            <input type="range" min="8" max="42" step="1" value="${Math.round(getAverageDecorationSize(customTheme.decorations) || 18)}" data-action="theme-sticker-size" />
          </label>
          <label>
            Accent color
            <input type="color" value="${escapeAttr(hexSafe(customTheme.sleeveColor, "#9cdfff"))}" data-action="theme-sticker-color" />
          </label>
        </div>
        <div class="page-style-actions">
          <button class="btn ghost small" data-action="theme-clear-stickers" type="button">Clear Stickers</button>
          <button class="btn ghost small" data-action="theme-clear-image" type="button">Clear Page Art</button>
          <button class="btn ghost small" data-action="theme-apply-all" type="button">Apply This Style To All Pages</button>
        </div>
      </div>
    `;

    const renameInput = wrap.querySelector('input[data-action="rename"]');
    const styleSelect = wrap.querySelector('select[data-action="style"]');
    const deleteBtn = wrap.querySelector('button[data-action="delete"]');
    const coverTitleInput = wrap.querySelector('input[data-action="cover-title"]');
    const coverImageInput = wrap.querySelector('input[data-action="cover-image"]');
    const pageTintInput = wrap.querySelector('input[data-action="page-tint"]');
    const coverAInput = wrap.querySelector('input[data-action="cover-a"]');
    const coverBInput = wrap.querySelector('input[data-action="cover-b"]');
    const sleeveInput = wrap.querySelector('input[data-action="sleeve"]');
    const coverScaleInput = wrap.querySelector('input[data-action="cover-scale"]');
    const coverFocusXInput = wrap.querySelector('input[data-action="cover-focus-x"]');
    const coverFocusYInput = wrap.querySelector('input[data-action="cover-focus-y"]');
    const clearCoverBtn = wrap.querySelector('button[data-action="clear-cover"]');
    const themePageSelect = wrap.querySelector('select[data-action="theme-page"]');
    const themeMethodSelect = wrap.querySelector('select[data-action="theme-method"]');
    const themePatternSelect = wrap.querySelector('select[data-action="theme-pattern"]');
    const themeTintInput = wrap.querySelector('input[data-action="theme-tint"]');
    const themeSleeveInput = wrap.querySelector('input[data-action="theme-sleeve"]');
    const themeStrengthInput = wrap.querySelector('input[data-action="theme-strength"]');
    const themeImageInput = wrap.querySelector('input[data-action="theme-image"]');
    const themeTitleInput = wrap.querySelector('input[data-action="theme-title"]');
    const themeSceneImageInput = wrap.querySelector('input[data-action="theme-scene-image"]');
    const themeClearImageBtn = wrap.querySelector('button[data-action="theme-clear-image"]');
    const themeStickerSizeInput = wrap.querySelector('input[data-action="theme-sticker-size"]');
    const themeStickerColorInput = wrap.querySelector('input[data-action="theme-sticker-color"]');
    const themeClearStickersBtn = wrap.querySelector('button[data-action="theme-clear-stickers"]');
    const themeApplyAllBtn = wrap.querySelector('button[data-action="theme-apply-all"]');
    const stickerPresetButtons = wrap.querySelectorAll('button[data-action="add-sticker"]');
    const panelAddButtons = wrap.querySelectorAll('button[data-action="add-panel"]');
    const panelRemoveButtons = wrap.querySelectorAll('button[data-action="remove-panel"]');
    const panelTitleInputs = wrap.querySelectorAll('input[data-action="panel-title"]');
    const panelShapeSelects = wrap.querySelectorAll('select[data-action="panel-shape"]');
    const panelWidthSelects = wrap.querySelectorAll('select[data-action="panel-width"]');
    const panelHeightSelects = wrap.querySelectorAll('select[data-action="panel-height"]');
    const panelImageInputs = wrap.querySelectorAll('input[data-action="panel-image"]');
    const panelLayerInputs = wrap.querySelectorAll('input[data-action="panel-layer"]');
    const panelZoomInputs = wrap.querySelectorAll('input[data-action="panel-zoom"]');
    const panelFocusXInputs = wrap.querySelectorAll('input[data-action="panel-focus-x"]');
    const panelFocusYInputs = wrap.querySelectorAll('input[data-action="panel-focus-y"]');
    const panelBackButtons = wrap.querySelectorAll('button[data-action="panel-back"]');
    const panelFrontButtons = wrap.querySelectorAll('button[data-action="panel-front"]');
    const panelLayoutEditor = wrap.querySelector('.panel-layout-editor');

    renameInput.addEventListener("change", () => {
      const newName = cleanText(renameInput.value);
      if (!newName) {
        renameInput.value = binder.name;
        return;
      }

      const duplicate = state.binders.some(
        (b) => b.id !== binder.id && b.name.toLowerCase() === newName.toLowerCase(),
      );

      if (duplicate) {
        status("That binder name is already used.");
        renameInput.value = binder.name;
        return;
      }

      binder.name = newName;
      persist();
      refreshBinderSelects();
      renderCollection();
      renderBinderManager();
    });

    styleSelect.addEventListener("change", () => {
      binder.style = styleSelect.value;
      const [na, nb] = BINDER_STYLES[binder.style] || BINDER_STYLES.ocean;
      binder.coverColorA = binder.coverColorA || na;
      binder.coverColorB = binder.coverColorB || nb;
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverTitleInput.addEventListener("change", () => {
      binder.coverTitle = cleanText(coverTitleInput.value) || binder.name;
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverImageInput.addEventListener("change", async () => {
      const file = coverImageInput.files?.[0];
      if (!file) return;
      binder.coverImage = await resizeImageFile(file, 1280, 0.82);
      persist();
      renderCollection();
      renderBinderManager();
      status(`Updated cover image for ${binder.name}.`);
    });

    pageTintInput.addEventListener("change", () => {
      binder.pageTint = pageTintInput.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverAInput.addEventListener("change", () => {
      binder.coverColorA = coverAInput.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverBInput.addEventListener("change", () => {
      binder.coverColorB = coverBInput.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    sleeveInput.addEventListener("change", () => {
      binder.sleeveColor = sleeveInput.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverScaleInput.addEventListener("change", () => {
      binder.coverImageScale = clamp(Number(coverScaleInput.value) || 100, 70, 220);
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverFocusXInput.addEventListener("change", () => {
      binder.coverImageFocusX = clamp(Number(coverFocusXInput.value) || 50, 0, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    coverFocusYInput.addEventListener("change", () => {
      binder.coverImageFocusY = clamp(Number(coverFocusYInput.value) || 50, 0, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    clearCoverBtn.addEventListener("click", () => {
      binder.coverImage = "";
      persist();
      renderCollection();
      renderBinderManager();
    });

    themePageSelect.addEventListener("change", () => {
      runtime.viewPageByBinder[binder.id] = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      renderCollection();
      renderBinderManager();
    });

    themeMethodSelect.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      const preset = PAGE_METHOD_PRESETS[themeMethodSelect.value] || PAGE_METHOD_PRESETS.classic;
      theme.method = themeMethodSelect.value;
      theme.patternStyle = preset.patternStyle;
      theme.pageTint = preset.pageTint;
      theme.sleeveColor = preset.sleeveColor;
      theme.patternStrength = preset.patternStrength;
      persist();
      renderCollection();
      renderBinderManager();
    });

    themePatternSelect.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.patternStyle = themePatternSelect.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeTintInput.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.pageTint = themeTintInput.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeSleeveInput.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.sleeveColor = themeSleeveInput.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeStrengthInput.addEventListener("input", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.patternStrength = clamp(Number(themeStrengthInput.value) || 45, 8, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeImageInput.addEventListener("change", async () => {
      const file = themeImageInput.files?.[0];
      if (!file) return;
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.backgroundImage = await resizeImageFile(file, 1600, 0.84);
      persist();
      renderCollection();
      renderBinderManager();
      status(`Updated Michi page art for ${binder.name} page ${page}.`);
    });

    themeSceneImageInput.addEventListener("change", async () => {
      const file = themeSceneImageInput.files?.[0];
      if (!file) return;
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      const firstPanel = theme.scenePanels[0];
      if (!firstPanel) {
        status("Add a scene panel first, then upload panel art.");
        return;
      }
      firstPanel.image = await resizeImageFile(file, 1600, 0.84);
      persist();
      renderCollection();
      renderBinderManager();
      status(`Updated scene panel art for ${binder.name} page ${page}.`);
    });

    themeTitleInput.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.designTitle = cleanText(themeTitleInput.value);
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeClearImageBtn.addEventListener("click", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.backgroundImage = "";
      persist();
      renderCollection();
      renderBinderManager();
    });

    panelAddButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const template = SCENE_PANEL_TEMPLATES[button.dataset.panelTemplate] || SCENE_PANEL_TEMPLATES.square;
        const panel = createScenePanelFromTemplate(template, theme);
        theme.scenePanels = [...theme.scenePanels, panel];
        rebalancePageForLayout(binder.id, page);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelRemoveButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        theme.scenePanels = theme.scenePanels.filter((panel) => panel.id !== button.dataset.panelId);
        rebalancePageForLayout(binder.id, page);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelTitleInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        theme.scenePanels = theme.scenePanels.map((panel) => panel.id === input.dataset.panelId ? { ...panel, title: cleanText(input.value) || panel.title } : panel);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelShapeSelects.forEach((select) => {
      select.addEventListener("change", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const template = SCENE_PANEL_TEMPLATES[select.value] || SCENE_PANEL_TEMPLATES.square;
        theme.scenePanels = theme.scenePanels.map((panel) => panel.id === select.dataset.panelId
          ? { ...panel, colSpan: template.colSpan, rowSpan: template.rowSpan, anchor: findNearestValidPanelAnchor(theme, panel.id, panel.anchor, template) }
          : panel);
        rebalancePageForLayout(binder.id, page);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelWidthSelects.forEach((select) => {
      select.addEventListener("change", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const nextWidth = clamp(Number(select.value) || 1, 1, 3);
        theme.scenePanels = theme.scenePanels.map((panel) => {
          if (panel.id !== select.dataset.panelId) return panel;
          const candidate = {
            ...panel,
            colSpan: nextWidth,
            anchor: findNearestValidPanelAnchor(theme, panel.id, panel.anchor, { ...panel, colSpan: nextWidth }),
          };
          return isPanelPlacementValid(theme.scenePanels, candidate, panel.id) ? candidate : panel;
        });
        rebalancePageForLayout(binder.id, page);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelHeightSelects.forEach((select) => {
      select.addEventListener("change", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const nextHeight = clamp(Number(select.value) || 1, 1, 3);
        theme.scenePanels = theme.scenePanels.map((panel) => {
          if (panel.id !== select.dataset.panelId) return panel;
          const candidate = {
            ...panel,
            rowSpan: nextHeight,
            anchor: findNearestValidPanelAnchor(theme, panel.id, panel.anchor, { ...panel, rowSpan: nextHeight }),
          };
          return isPanelPlacementValid(theme.scenePanels, candidate, panel.id) ? candidate : panel;
        });
        rebalancePageForLayout(binder.id, page);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelImageInputs.forEach((input) => {
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const image = await resizeImageFile(file, 1600, 0.84);
        theme.scenePanels = theme.scenePanels.map((panel) => panel.id === input.dataset.panelId ? { ...panel, image } : panel);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelLayerInputs.forEach((input) => {
      input.addEventListener("change", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, input.dataset.panelId, (panel) => ({
          ...panel,
          layer: clamp(Number(input.value) || 12, 1, 40),
        }));
      });
    });

    panelZoomInputs.forEach((input) => {
      input.addEventListener("change", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, input.dataset.panelId, (panel) => ({
          ...panel,
          zoom: clamp(Number(input.value) || 100, 60, 260),
        }));
      });
    });

    panelFocusXInputs.forEach((input) => {
      input.addEventListener("change", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, input.dataset.panelId, (panel) => ({
          ...panel,
          focusX: clamp(Number(input.value) || 50, 0, 100),
        }));
      });
    });

    panelFocusYInputs.forEach((input) => {
      input.addEventListener("change", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, input.dataset.panelId, (panel) => ({
          ...panel,
          focusY: clamp(Number(input.value) || 50, 0, 100),
        }));
      });
    });

    panelBackButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, button.dataset.panelId, (panel) => ({
          ...panel,
          layer: clamp(Number(panel.layer || 12) - 1, 1, 40),
        }));
      });
    });

    panelFrontButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, button.dataset.panelId, (panel) => ({
          ...panel,
          layer: clamp(Number(panel.layer || 12) + 1, 1, 40),
        }));
      });
    });

    renderPanelLayoutEditor(panelLayoutEditor, binder, customPage);

    stickerPresetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const kind = button.dataset.sticker;
        const next = {
          id: cryptoRandom(),
          kind,
          x: 14 + Math.random() * 72,
          y: 14 + Math.random() * 72,
          size: clamp(Number(themeStickerSizeInput.value) || 18, 8, 42),
          rotation: Math.round((Math.random() * 36) - 18),
          opacity: 0.94,
          color: themeStickerColorInput.value,
        };
        theme.decorations = [...normalizeDecorations(theme.decorations), next];
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    themeStickerSizeInput.addEventListener("input", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      const size = clamp(Number(themeStickerSizeInput.value) || 18, 8, 42);
      theme.decorations = normalizeDecorations(theme.decorations).map((item) => ({ ...item, size }));
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeStickerColorInput.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      const color = themeStickerColorInput.value;
      theme.decorations = normalizeDecorations(theme.decorations).map((item) => ({ ...item, color }));
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeClearStickersBtn.addEventListener("click", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.decorations = [];
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeApplyAllBtn.addEventListener("click", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const source = getPageTheme(binder, page);
      const map = {};
      for (let p = 1; p <= maxPages; p += 1) {
        map[String(p)] = {
          method: source.method,
          patternStyle: source.patternStyle,
          pageTint: source.pageTint,
          sleeveColor: source.sleeveColor,
          patternStrength: source.patternStrength,
          backgroundImage: source.backgroundImage,
          designTitle: source.designTitle,
          layoutPreset: source.layoutPreset,
          sceneImage: source.sceneImage,
          scenePanels: normalizeScenePanels(source.scenePanels, source),
          decorations: normalizeDecorations(source.decorations),
        };
      }
      binder.pageThemes = map;
      persist();
      renderCollection();
      renderBinderManager();
      status(`Applied ${getPageMethodLabel(source.method)} method to all pages in ${binder.name}.`);
    });

    deleteBtn.addEventListener("click", () => {
      if (state.binders.length <= 1) {
        status("At least one binder is required.");
        return;
      }

      const cardsInBinder = state.cards.filter((c) => c.binderId === binder.id);
      const fallback = state.binders.find((b) => b.id !== binder.id);

      const ok = window.confirm(
        cardsInBinder.length
          ? `Delete ${binder.name}? ${cardsInBinder.length} cards will move to ${fallback.name}.`
          : `Delete ${binder.name}?`,
      );
      if (!ok) return;

      state.cards = state.cards.map((card) => {
        if (card.binderId !== binder.id) return card;
        const page = findPageWithSpace(fallback.id);
        return {
          ...card,
          binderId: fallback.id,
          page,
          slotOrder: getNextSlotOrder(fallback.id, page),
        };
      });
      state.binders = state.binders.filter((b) => b.id !== binder.id);
      delete runtime.viewPageByBinder[binder.id];

      persist();
      refreshBinderSelects();
      renderCollection();
      renderBinderManager();
      status(`Deleted binder ${binder.name}.`);
    });

    els.binderManager.appendChild(wrap);
  });
}

function refreshBinderSelects() {
  const binderOptions = state.binders
    .map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`)
    .join("");

  const currentSave = els.editBinder.value;
  els.editBinder.innerHTML = binderOptions;
  if (state.binders.some((b) => b.id === currentSave)) {
    els.editBinder.value = currentSave;
  }

  const currentFilter = els.binderFilter.value;
  els.binderFilter.innerHTML = `<option value="all">All binders</option>${binderOptions}`;
  if (currentFilter && (currentFilter === "all" || state.binders.some((b) => b.id === currentFilter))) {
    els.binderFilter.value = currentFilter;
  }
}

function applyTheme(themeName) {
  APP_THEMES.forEach((name) => {
    els.app.classList.remove(name);
  });
  els.app.classList.add(themeName);
  state.activeTheme = themeName;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.cards)) state.cards = parsed.cards;
    if (Array.isArray(parsed.binders) && parsed.binders.length) state.binders = parsed.binders;
    if (parsed.profile && typeof parsed.profile === "object") {
      state.profile = {
        name: cleanText(parsed.profile.name) || "Collector",
        favorite: cleanText(parsed.profile.favorite),
        bio: cleanText(parsed.profile.bio),
      };
    }
    if (Array.isArray(parsed.news)) state.news = parsed.news;
    if (parsed.newsFetchedAt) state.newsFetchedAt = Number(parsed.newsFetchedAt) || 0;
    normalizePagingState();
    if (parsed.activeTheme && APP_THEMES.includes(parsed.activeTheme)) state.activeTheme = parsed.activeTheme;
    if (parsed.activeTab) state.activeTab = parsed.activeTab;
  } catch {
    // Keep defaults.
  }
}

function persist() {
  const payload = {
    cards: state.cards,
    binders: state.binders,
    profile: state.profile,
    activeTheme: state.activeTheme,
    activeTab: state.activeTab,
    news: state.news,
    newsFetchedAt: state.newsFetchedAt,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function normalizePagingState() {
  state.binders = state.binders.map((binder) => {
    const [a, b] = BINDER_STYLES[binder.style] || BINDER_STYLES.ocean;
    const pageThemes = binder.pageThemes && typeof binder.pageThemes === "object"
      ? Object.fromEntries(
        Object.entries(binder.pageThemes).map(([page, theme]) => [page, {
          method: cleanText(theme?.method) || "classic",
          patternStyle: cleanText(theme?.patternStyle) || binder.style || "ocean",
          pageTint: hexSafe(theme?.pageTint, "#0f1d2f"),
          sleeveColor: hexSafe(theme?.sleeveColor, "#9cdfff"),
          patternStrength: clamp(Number(theme?.patternStrength || 45), 8, 100),
          backgroundImage: cleanText(theme?.backgroundImage),
          designTitle: cleanText(theme?.designTitle),
          layoutPreset: cleanText(theme?.layoutPreset) || "grid",
          sceneImage: cleanText(theme?.sceneImage),
          scenePanels: normalizeScenePanels(theme?.scenePanels, theme),
          decorations: normalizeDecorations(theme?.decorations),
        }]),
      )
      : {};
    return {
      ...defaultBinder(),
      ...binder,
      pages: Math.max(1, Number(binder.pages) || 1),
      coverTitle: cleanText(binder.coverTitle) || cleanText(binder.name) || "Main Binder",
      coverColorA: hexSafe(binder.coverColorA, a),
      coverColorB: hexSafe(binder.coverColorB, b),
      sleeveColor: hexSafe(binder.sleeveColor, "#9cdfff"),
      pageTint: hexSafe(binder.pageTint, "#0f1d2f"),
      coverImage: binder.coverImage || "",
      coverImageScale: clamp(Number(binder.coverImageScale) || 100, 70, 220),
      coverImageFocusX: clamp(Number(binder.coverImageFocusX) || 50, 0, 100),
      coverImageFocusY: clamp(Number(binder.coverImageFocusY) || 50, 0, 100),
      pageMethodDefault: cleanText(binder.pageMethodDefault) || "classic",
      pageThemes,
    };
  });

  if (!state.binders.length) {
    state.binders = [defaultBinder()];
  }

  const firstBinderId = state.binders[0].id;
  const pageCounters = {};
  state.cards = state.cards.map((card) => {
    const binderExists = state.binders.some((b) => b.id === card.binderId);
    const binderId = binderExists ? card.binderId : firstBinderId;
    const binder = state.binders.find((b) => b.id === binderId) || state.binders[0];
    const page = clamp(Number(card.page) || 1, 1, binder.pages);
    const key = `${binderId}:${page}`;

    pageCounters[key] = (pageCounters[key] || 0) + 1;

    return {
      ...card,
      binderId,
      page,
      rawValue: Number(card.rawValue) || 0,
      psa9Value: Number(card.psa9Value) || 0,
      psa10Value: Number(card.psa10Value) || 0,
      slotOrder: Number(card.slotOrder) || pageCounters[key],
      subtypes: Array.isArray(card.subtypes) ? card.subtypes : [],
      types: Array.isArray(card.types) ? card.types : [],
      evolvesTo: Array.isArray(card.evolvesTo) ? card.evolvesTo : [],
      abilities: Array.isArray(card.abilities) ? card.abilities : [],
      attacks: Array.isArray(card.attacks) ? card.attacks : [],
      weaknesses: Array.isArray(card.weaknesses) ? card.weaknesses : [],
      resistances: Array.isArray(card.resistances) ? card.resistances : [],
      retreatCost: Array.isArray(card.retreatCost) ? card.retreatCost : [],
      rules: Array.isArray(card.rules) ? card.rules : [],
      nationalPokedexNumbers: Array.isArray(card.nationalPokedexNumbers) ? card.nationalPokedexNumbers : [],
      scan: card.scan && typeof card.scan === "object" ? card.scan : null,
    };
  });

  state.binders.forEach((binder) => {
    const maxPage = state.cards
      .filter((card) => card.binderId === binder.id)
      .reduce((m, card) => Math.max(m, Number(card.page || 1)), 1);
    binder.pages = Math.max(binder.pages, maxPage, 1);
  });
}

function defaultBinder(name = "Main Binder") {
  const [a, b] = BINDER_STYLES.ocean;
  return {
    id: cryptoRandom(),
    name,
    style: "ocean",
    pages: 1,
    coverTitle: name,
    coverColorA: a,
    coverColorB: b,
    sleeveColor: "#9cdfff",
    pageTint: "#0f1d2f",
    coverImage: "",
    coverImageScale: 100,
    coverImageFocusX: 50,
    coverImageFocusY: 50,
    pageMethodDefault: "classic",
    pageThemes: {},
  };
}

function hexSafe(value, fallback) {
  const v = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
}

function findPageWithSpace(binderId) {
  const binder = state.binders.find((b) => b.id === binderId);
  if (!binder) return 1;

  for (let page = 1; page <= binder.pages; page += 1) {
    if (countCardsInPage(binderId, page) < getPageCapacity(binderId, page)) {
      return page;
    }
  }

  binder.pages += 1;
  return binder.pages;
}

function countCardsInPage(binderId, page) {
  return state.cards.filter((card) => card.binderId === binderId && Number(card.page || 1) === page).length;
}

function getPageCapacity(binderId, page) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return 9;
  return getAvailableSlotsForTheme(getPageTheme(binder, page)).length;
}

function getNextSlotOrder(binderId, page) {
  const binder = state.binders.find((item) => item.id === binderId);
  const available = binder ? getAvailableSlotsForTheme(getPageTheme(binder, page)) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const taken = new Set(
    state.cards
      .filter((card) => card.binderId === binderId && Number(card.page || 1) === page)
      .map((card) => Number(card.slotOrder) || 0),
  );
  for (const slot of available) {
    if (!taken.has(slot)) return slot;
  }
  return available[available.length - 1] || 9;
}

function getViewedPage(binderId, maxPage) {
  const current = Number(runtime.viewPageByBinder[binderId] || 1);
  return clamp(current, 1, Math.max(1, maxPage));
}

function sortCardsForPage(cards, sortBy) {
  const copy = [...cards];
  if (sortBy === "grade") {
    return copy.sort((a, b) => b.grade - a.grade);
  }
  if (sortBy === "name") {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortBy === "newest") {
    return copy.sort((a, b) => b.addedAt - a.addedAt);
  }
  return copy.sort((a, b) => {
    const sa = Number(a.slotOrder) || 0;
    const sb = Number(b.slotOrder) || 0;
    if (sa !== sb) return sa - sb;
    return b.addedAt - a.addedAt;
  });
}

function placeCardInSlot(cardId, binderId, page, slotNumber) {
  const moved = state.cards.find((card) => card.id === cardId);
  if (!moved) return;

  const currentBinderId = moved.binderId;
  const currentPage = Number(moved.page || 1);
  const currentSlot = Number(moved.slotOrder || 0);
  const targetSlot = clamp(Number(slotNumber) || 1, 1, 9);
  const binder = state.binders.find((item) => item.id === binderId);
  if (binder && getReservedSlotsForTheme(getPageTheme(binder, page)).has(targetSlot)) {
    status("That slot is reserved for page artwork in the current layout.");
    return;
  }
  const occupant = state.cards.find(
    (card) => card.id !== cardId && card.binderId === binderId && Number(card.page || 1) === Number(page) && Number(card.slotOrder || 0) === targetSlot,
  );

  if (occupant) {
    state.cards = state.cards.map((card) => {
      if (card.id === moved.id) {
        return { ...card, binderId, page: Number(page), slotOrder: targetSlot };
      }
      if (card.id === occupant.id) {
        return {
          ...card,
          binderId: currentBinderId,
          page: currentPage,
          slotOrder: currentSlot || getNextSlotOrder(currentBinderId, currentPage),
        };
      }
      return card;
    });
  } else {
    if (currentBinderId !== binderId && countCardsInPage(binderId, Number(page)) >= getPageCapacity(binderId, Number(page))) {
      status(`Page ${page} is full. Clear a slot first.`);
      return;
    }
    state.cards = state.cards.map((card) => {
      if (card.id !== moved.id) return card;
      return { ...card, binderId, page: Number(page), slotOrder: targetSlot };
    });
  }

  persist();
  renderCollection();
  renderBinderManager();
}

function reorderCardsInPage(binderId, page, sourceId, targetId) {
  const pageCards = sortCardsForPage(
    state.cards.filter((card) => card.binderId === binderId && Number(card.page || 1) === page),
    "binder",
  );

  const sourceIdx = pageCards.findIndex((card) => card.id === sourceId);
  const targetIdx = pageCards.findIndex((card) => card.id === targetId);
  if (sourceIdx < 0 || targetIdx < 0 || sourceIdx === targetIdx) return;

  const [moved] = pageCards.splice(sourceIdx, 1);
  pageCards.splice(targetIdx, 0, moved);

  const orderMap = new Map(pageCards.map((card, idx) => [card.id, idx + 1]));

  state.cards = state.cards.map((card) => {
    if (card.binderId !== binderId || Number(card.page || 1) !== page) return card;
    return {
      ...card,
      slotOrder: orderMap.get(card.id) || card.slotOrder,
    };
  });

  persist();
  renderCollection();
}

function moveCardToPage(cardId, binderId, targetPage) {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return;

  const safeTarget = Math.max(1, Number(targetPage) || 1);
  const fromBinderId = card.binderId;
  const fromPage = Number(card.page || 1);

  if (card.binderId === binderId && fromPage === safeTarget) {
    return;
  }

  if (countCardsInPage(binderId, safeTarget) >= getPageCapacity(binderId, safeTarget)) {
    status(`Page ${safeTarget} is full. Move a card out first.`);
    return;
  }

  state.cards = state.cards.map((c) => {
    if (c.id !== cardId) return c;
    return {
      ...c,
      binderId,
      page: safeTarget,
      slotOrder: getNextSlotOrder(binderId, safeTarget),
    };
  });

  persist();
  renderCollection();
  renderBinderManager();
}

function rebalancePageForLayout(binderId, page) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return;
  const pageCards = sortCardsForPage(
    state.cards.filter((card) => card.binderId === binderId && Number(card.page || 1) === Number(page)),
    "binder",
  );
  const availableSlots = getAvailableSlotsForTheme(getPageTheme(binder, page));

  const stayIds = new Set(pageCards.slice(0, availableSlots.length).map((card) => card.id));
  state.cards = state.cards.map((card) => {
    if (card.binderId !== binderId || Number(card.page || 1) !== Number(page)) return card;
    if (!stayIds.has(card.id)) return card;
    const idx = pageCards.findIndex((item) => item.id === card.id);
    return {
      ...card,
      slotOrder: availableSlots[idx] || card.slotOrder,
    };
  });

  pageCards.slice(availableSlots.length).forEach((card) => {
    const targetPage = findPageWithSpace(binderId);
    state.cards = state.cards.map((item) => {
      if (item.id !== card.id) return item;
      return {
        ...item,
        page: targetPage,
        slotOrder: getNextSlotOrder(binderId, targetPage),
      };
    });
  });
}

function normalizeSlotOrder(binderId, page) {
  const sorted = sortCardsForPage(
    state.cards.filter((card) => card.binderId === binderId && Number(card.page || 1) === Number(page)),
    "binder",
  );

  const map = new Map(sorted.map((card, idx) => [card.id, idx + 1]));
  state.cards = state.cards.map((card) => {
    if (card.binderId !== binderId || Number(card.page || 1) !== Number(page)) return card;
    return {
      ...card,
      slotOrder: map.get(card.id) || card.slotOrder,
    };
  });
}

function getEstimatedGradedValue(card) {
  const grade = Number(card.grade || 0);
  if (grade >= 9.5) return Number(card.psa10Value || card.rawValue || 0);
  if (grade >= 8.5) return Number(card.psa9Value || card.rawValue || 0);
  return Number(card.rawValue || 0) * 1.15;
}

function getBinderLabel(binderId) {
  return state.binders.find((binder) => binder.id === binderId)?.coverTitle
    || state.binders.find((binder) => binder.id === binderId)?.name
    || "Binder";
}

function money(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(num);
}

function extractCardValues(card) {
  const prices = card?.tcgplayer?.prices || {};
  const cardmarket = Number(card?.cardmarket?.prices?.averageSellPrice || 0);
  const tcgPrice = Object.values(prices)
    .map((entry) => Number(entry?.market || entry?.mid || entry?.low || 0))
    .find((value) => value > 0) || 0;
  const raw = roundMoney(cardmarket || tcgPrice || 0);
  return estimateFallbackValues(raw);
}

function extractAutoCardData(card) {
  if (!card || typeof card !== "object") return {};

  return {
    name: cleanText(card.name),
    set: cleanText(card.set?.name),
    number: cleanText(card.number),
    rarity: cleanText(card.rarity),
    supertype: cleanText(card.supertype),
    subtypes: asCleanStringArray(card.subtypes),
    hp: cleanText(card.hp),
    types: asCleanStringArray(card.types),
    evolvesFrom: cleanText(card.evolvesFrom),
    evolvesTo: asCleanStringArray(card.evolvesTo),
    abilities: Array.isArray(card.abilities)
      ? card.abilities
        .map((ability) => ({
          name: cleanText(ability?.name),
          text: cleanText(ability?.text),
          type: cleanText(ability?.type),
        }))
        .filter((ability) => ability.name || ability.text || ability.type)
      : [],
    attacks: Array.isArray(card.attacks)
      ? card.attacks
        .map((attack) => ({
          name: cleanText(attack?.name),
          text: cleanText(attack?.text),
          damage: cleanText(attack?.damage),
          cost: asCleanStringArray(attack?.cost),
          convertedEnergyCost: Number(attack?.convertedEnergyCost) || 0,
        }))
        .filter((attack) => attack.name || attack.text || attack.damage)
      : [],
    weaknesses: Array.isArray(card.weaknesses)
      ? card.weaknesses
        .map((row) => ({
          type: cleanText(row?.type),
          value: cleanText(row?.value),
        }))
        .filter((row) => row.type || row.value)
      : [],
    resistances: Array.isArray(card.resistances)
      ? card.resistances
        .map((row) => ({
          type: cleanText(row?.type),
          value: cleanText(row?.value),
        }))
        .filter((row) => row.type || row.value)
      : [],
    retreatCost: asCleanStringArray(card.retreatCost),
    convertedRetreatCost: Number(card.convertedRetreatCost) || 0,
    artist: cleanText(card.artist),
    flavorText: cleanText(card.flavorText),
    regulationMark: cleanText(card.regulationMark),
    rules: asCleanStringArray(card.rules),
    legalities: card.legalities && typeof card.legalities === "object" ? {
      unlimited: cleanText(card.legalities.unlimited),
      expanded: cleanText(card.legalities.expanded),
      standard: cleanText(card.legalities.standard),
    } : {},
    nationalPokedexNumbers: Array.isArray(card.nationalPokedexNumbers)
      ? card.nationalPokedexNumbers.filter((n) => Number.isFinite(Number(n))).map((n) => Number(n))
      : [],
    images: {
      small: cleanText(card.images?.small),
      large: cleanText(card.images?.large),
    },
    tcg: {
      id: cleanText(card.id),
      setId: cleanText(card.set?.id),
      setSeries: cleanText(card.set?.series),
      setTotal: Number(card.set?.total) || 0,
      setPrintedTotal: Number(card.set?.printedTotal) || 0,
      releaseDate: cleanText(card.set?.releaseDate),
      ptcgoCode: cleanText(card.set?.ptcgoCode),
      tcgplayerUrl: cleanText(card.tcgplayer?.url),
      cardmarketUrl: cleanText(card.cardmarket?.url),
    },
  };
}

function extractOcrCardHints(ocrText) {
  const text = String(ocrText || "");
  const probableName = guessPokemonName(text);
  const number = text.match(/\b\d{1,3}\/\d{1,3}\b/i)?.[0] || "";
  const hp = text.match(/\b(\d{2,3})\s*hp\b/i)?.[1] || "";

  return {
    name: probableName ? titleCase(probableName) : "",
    set: "",
    number,
    rarity: "",
    hp,
  };
}

function asCleanStringArray(values) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => cleanText(value)).filter(Boolean);
}

function countAutoCapturedFields(record) {
  if (!record || typeof record !== "object") return 0;
  const keys = [
    "name", "set", "number", "rarity", "supertype", "hp", "evolvesFrom", "artist", "flavorText", "regulationMark",
  ];

  let count = keys.reduce((sum, key) => sum + (cleanText(record[key]) ? 1 : 0), 0);
  const lists = [
    "subtypes", "types", "evolvesTo", "abilities", "attacks", "weaknesses", "resistances", "retreatCost", "rules", "nationalPokedexNumbers",
  ];
  count += lists.reduce((sum, key) => sum + (Array.isArray(record[key]) && record[key].length ? 1 : 0), 0);
  if (record.tcg && typeof record.tcg === "object" && cleanText(record.tcg.id)) count += 1;
  if (record.images && typeof record.images === "object" && (cleanText(record.images.small) || cleanText(record.images.large))) count += 1;

  return count;
}

function estimateFallbackValues(raw) {
  const safeRaw = Number(raw || 0);
  return {
    raw: roundMoney(safeRaw),
    psa9: roundMoney(safeRaw * 1.85),
    psa10: roundMoney(safeRaw * 3.25),
  };
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function summarizeHtml(html) {
  const text = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function extractNewsImage(item) {
  const enclosure = item?.enclosure?.link || item?.thumbnail;
  if (enclosure) return enclosure;
  const html = item?.description || item?.content || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || "";
}

function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fallbackNewsItem() {
  return {
    title: "Pokemon TCG headlines unavailable",
    link: NEWS_RSS_URL,
    source: "News feed",
    pubDate: formatNewsDate(new Date().toISOString()),
    summary: "The live news feed could not load right now. Use Refresh News to try again.",
    image: "",
  };
}

function buildCuratedNewsItems() {
  return CURATED_NEWS_ITEMS.map((item, index) => ({
    title: item.title,
    link: item.link,
    source: item.source,
    pubDate: formatNewsDate(new Date(Date.now() - index * 86400000).toISOString()),
    summary: item.summary,
    image: item.image,
  }));
}

function openCardDetailModal(card, context = {}) {
  if (!card || !els.cardDetailModal) return;
  const binderName = cleanText(context.binderName) || getBinderLabel(card.binderId);
  const page = Number(context.page || card.page || 1);
  const slot = Number(context.slot || card.slotOrder || 0);

  els.cardDetailContext.textContent = `${binderName} · Page ${page}${slot ? ` · Slot ${slot}` : ""}`;
  els.cardDetailTitle.textContent = card.name || "Card Details";
  els.cardDetailImage.src = card.image || "";
  els.cardDetailName.textContent = card.name || "Unknown Card";
  els.cardDetailMeta.textContent = [card.set, card.number && `#${card.number}`, card.rarity].filter(Boolean).join(" · ") || "Card metadata pending";

  els.cardDetailGradeRow.innerHTML = `
    <div><span>Grade</span><strong>${Number(card.grade || 0).toFixed(1)}</strong></div>
    <div><span>Raw</span><strong>${money(card.rawValue || 0)}</strong></div>
    <div><span>PSA 9</span><strong>${money(card.psa9Value || 0)}</strong></div>
    <div><span>PSA 10</span><strong>${money(card.psa10Value || 0)}</strong></div>
  `;

  renderAutoInfoGrid(els.cardDetailFields, card, {
    fields: [
      ["HP", card.hp],
      ["Supertype", card.supertype],
      ["Types", joinList(card.types)],
      ["Subtypes", joinList(card.subtypes)],
      ["Evolves From", card.evolvesFrom],
      ["Evolves To", joinList(card.evolvesTo)],
      ["Artist", card.artist],
      ["Reg. Mark", card.regulationMark],
      ["Retreat", joinList(card.retreatCost)],
      ["Weaknesses", formatWeakResList(card.weaknesses)],
      ["Resistances", formatWeakResList(card.resistances)],
      ["Abilities", asCountLabel(card.abilities, "ability")],
      ["Attacks", asCountLabel(card.attacks, "attack")],
      ["Rules", asCountLabel(card.rules, "rule")],
      ["Pokedex #", joinList(card.nationalPokedexNumbers)],
      ["Set ID", card.tcg?.setId],
      ["Series", card.tcg?.setSeries],
      ["Release", card.tcg?.releaseDate],
      ["TCG Card ID", card.tcg?.id],
      ["Scan Confidence", card.scan?.confidence],
      ["Auto Fields", card.scan?.autoFieldCount != null ? String(card.scan.autoFieldCount) : ""],
    ],
  });

  els.cardDetailModal.classList.remove("hidden");
  els.cardDetailModal.setAttribute("aria-hidden", "false");
}

function closeCardDetailModal() {
  if (!els.cardDetailModal) return;
  els.cardDetailModal.classList.add("hidden");
  els.cardDetailModal.setAttribute("aria-hidden", "true");
}

function renderAutoInfoGrid(target, source, config = {}) {
  if (!target) return;
  const rows = Array.isArray(config.fields) ? config.fields : [];
  target.innerHTML = "";

  const filled = rows
    .map(([label, value]) => ({ label, value: cleanText(value) }))
    .filter((row) => row.value);

  if (!filled.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No extra fields captured yet. Scan clarity and set text improve full metadata capture.";
    target.appendChild(empty);
    return;
  }

  filled.forEach((row) => {
    const item = document.createElement("div");
    item.className = "auto-info-item";
    item.innerHTML = `<span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong>`;
    target.appendChild(item);
  });
}

function joinList(values) {
  if (!Array.isArray(values) || !values.length) return "";
  return values.map((value) => cleanText(value)).filter(Boolean).join(", ");
}

function asCountLabel(values, noun) {
  if (!Array.isArray(values) || !values.length) return "";
  return `${values.length} ${noun}${values.length === 1 ? "" : "s"}`;
}

function formatWeakResList(values) {
  if (!Array.isArray(values) || !values.length) return "";
  return values
    .map((entry) => [cleanText(entry?.type), cleanText(entry?.value)].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" · ");
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

function sampleRegion(data, width, height, x1, y1, x2, y2, borderOnly = false) {
  const values = [];
  const sx = Math.floor(width * x1);
  const sy = Math.floor(height * y1);
  const ex = Math.floor(width * x2);
  const ey = Math.floor(height * y2);

  for (let y = sy; y < ey; y += 2) {
    for (let x = sx; x < ex; x += 2) {
      if (borderOnly) {
        const thick = 16;
        const onBorder =
          x < sx + thick ||
          x > ex - thick ||
          y < sy + thick ||
          y > ey - thick;
        if (!onBorder) continue;
      }

      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      values.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
    }
  }

  return values;
}

function luminanceVariance(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / 255;
}

function contrastRatio(aVals, bVals) {
  if (!aVals.length || !bVals.length) return 0;
  const a = aVals.reduce((x, y) => x + y, 0) / aVals.length;
  const b = bVals.reduce((x, y) => x + y, 0) / bVals.length;
  return Math.abs(a - b) / 255;
}

function sobelSharpness(data, width, height) {
  let total = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const idx = (yy, xx) => {
        const i = (yy * width + xx) * 4;
        return (data[i] + data[i + 1] + data[i + 2]) / 3;
      };

      const gx =
        -idx(y - 1, x - 1) + idx(y - 1, x + 1) +
        -2 * idx(y, x - 1) + 2 * idx(y, x + 1) +
        -idx(y + 1, x - 1) + idx(y + 1, x + 1);

      const gy =
        -idx(y - 1, x - 1) - 2 * idx(y - 1, x) - idx(y - 1, x + 1) +
        idx(y + 1, x - 1) + 2 * idx(y + 1, x) + idx(y + 1, x + 1);

      const mag = Math.sqrt(gx * gx + gy * gy) / 1024;
      total += mag;
      count += 1;
    }
  }

  return clamp(count ? total / count : 0, 0, 1);
}

function sanitizeOcrText(text) {
  return String(text || "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function guessPokemonName(ocrText) {
  if (!ocrText) return "";
  const known = [
    "charizard", "pikachu", "mew", "mewtwo", "blastoise", "venusaur", "gengar", "eevee",
    "snorlax", "lugia", "ho oh", "rayquaza", "dragonite", "alakazam", "machamp", "gyarados",
    "umbreon", "espeon", "lucario", "greninja", "gardevoir", "dialga", "palkia", "arceus",
    "zapdos", "articuno", "moltres", "raichu", "scizor", "tyranitar", "sylveon", "vaporeon",
  ];

  const lower = ocrText.toLowerCase();
  const exact = known.find((name) => lower.includes(name));
  if (exact) return exact;
  return "";
}

function extractSearchTokens(ocrText) {
  const stop = new Set([
    "basic", "stage", "pokemon", "trainer", "energy", "attack", "damage", "hp", "item", "supporter",
    "coin", "flip", "your", "this", "that", "with", "from", "and", "the", "for", "can", "use",
  ]);
  const words = String(ocrText || "")
    .toLowerCase()
    .split(" ")
    .map((w) => w.replace(/[^a-z0-9-]/g, ""))
    .filter((w) => w.length >= 4 && !stop.has(w));
  return [...new Set(words)];
}

function scoreCardMatch(card, ocrText) {
  const text = String(ocrText || "").toLowerCase();
  const name = String(card?.name || "").toLowerCase();
  const set = String(card?.set?.name || "").toLowerCase();
  const number = String(card?.number || "").toLowerCase();

  let score = 0;
  if (name && text.includes(name)) score += 90;
  if (number && text.includes(number)) score += 20;
  if (set && text.includes(set)) score += 14;

  const nameParts = name.split(/\s+/).filter((w) => w.length >= 3);
  nameParts.forEach((part) => {
    if (text.includes(part)) score += 15;
    else if (fuzzyContains(text, part, 1)) score += 6;
  });

  if (name.startsWith("pikachu") && fuzzyContains(text, "pikachu", 2)) score += 24;
  return score;
}

function fuzzyContains(haystack, needle, maxDistance) {
  if (!haystack || !needle) return false;
  if (haystack.includes(needle)) return true;
  const words = haystack.split(/\s+/).filter(Boolean);
  return words.some((word) => levenshtein(word, needle) <= maxDistance);
}

function levenshtein(a, b) {
  const s = String(a || "");
  const t = String(b || "");
  const m = s.length;
  const n = t.length;
  if (!m) return n;
  if (!n) return m;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[m][n];
}

function makeTopStripDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cropH = Math.max(80, Math.round(img.height * 0.27));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = cropH * 2;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, img.width, cropH, 0, 0, canvas.width, canvas.height);

      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const boosted = Math.max(0, Math.min(255, (gray - 112) * 1.6 + 128));
        d[i] = boosted;
        d[i + 1] = boosted;
        d[i + 2] = boosted;
      }
      ctx.putImageData(id, 0, 0);
      resolve(canvas.toDataURL("image/png", 0.92));
    };
    img.onerror = () => reject(new Error("Could not process OCR strip"));
    img.src = dataUrl;
  });
}
