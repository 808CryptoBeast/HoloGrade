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
      <button class="binder-cover-card" data-action="toggle-binder" type="button" style="background-image:${coverBg};">
        <span class="binder-spine"></span>
        <span class="binder-cover-copy">
          <span class="binder-cover-title">${escapeHtml(coverTitle)}</span>
          <span class="binder-cover-meta">${cards.length} cards · ${totalPages} page${totalPages === 1 ? "" : "s"}</span>
        </span>
      </button>

      <div class="binder-interior">
      <header class="binder-header" style="background-image:${coverBg}; background-size:cover; background-position:center;">
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
      <div class="binder-grid" data-binder-id="${binder.id}" data-page="${currentPage}" style="background-color:${pageTint}; background-image:url(${pageDoodle}), radial-gradient(circle at center, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px);"></div>
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
    const placedCards = allCardsOnPage.filter((card) => Number(card.slotOrder) >= 1 && Number(card.slotOrder) <= 9);
    for (let i = 0; i < 9; i += 1) {
      const slotNumber = i + 1;
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
  for (let slotNumber = 1; slotNumber <= 9; slotNumber += 1) {
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

  return {
    method: cleanText(fromMap.method) || fallbackMethod,
    patternStyle: cleanText(fromMap.patternStyle) || fallbackPreset.patternStyle || binder.style || "ocean",
    pageTint: hexSafe(fromMap.pageTint, fallbackPreset.pageTint || binder.pageTint || "#0f1d2f"),
    sleeveColor: hexSafe(fromMap.sleeveColor, fallbackPreset.sleeveColor || binder.sleeveColor || "#9cdfff"),
    patternStrength: clamp(Number(fromMap.patternStrength || fallbackPreset.patternStrength || 45), 8, 100),
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
  };
  return binder.pageThemes[String(page)];
}

function getPageMethodLabel(method) {
  return PAGE_METHOD_PRESETS[method]?.label || "Custom";
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

    if (countCardsInPage(card.binderId, targetPage) >= 9) {
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
  for (let slotNumber = 1; slotNumber <= 9; slotNumber += 1) {
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
  els.newsStatus.textContent = "Loading";
  try {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(NEWS_RSS_URL)}&count=6`;
    const response = await fetch(endpoint, { cache: force ? "no-store" : "default" });
    if (!response.ok) {
      throw new Error(`rss2json responded ${response.status}`);
    }
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    state.news = items.slice(0, 6).map((item) => ({
      title: cleanText(item.title) || "Pokemon TCG Update",
      link: item.link || NEWS_RSS_URL,
      source: cleanText(item.author || data.feed?.title || "Google News"),
      pubDate: formatNewsDate(item.pubDate),
      summary: summarizeHtml(item.description || item.content || "Recent Pokemon TCG headline."),
      image: extractNewsImage(item),
    }));
    state.newsFetchedAt = Date.now();
    persist();
    updateNewsStatus();
    renderDashboard();
  } catch {
    try {
      // Fallback when rss2json returns 422/rate errors.
      const xmlText = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(NEWS_RSS_URL)}`, {
        cache: force ? "no-store" : "default",
      }).then((resp) => {
        if (!resp.ok) throw new Error(`allorigins responded ${resp.status}`);
        return resp.text();
      });

      const items = parseRssXmlItems(xmlText).slice(0, 6);
      state.news = items.length ? items : [fallbackNewsItem()];
      state.newsFetchedAt = Date.now();
      persist();
      updateNewsStatus();
      renderDashboard();
    } catch {
      if (!state.news.length) {
        state.news = [fallbackNewsItem()];
        state.newsFetchedAt = Date.now();
        persist();
      }
      els.newsStatus.textContent = "Offline";
      renderDashboard();
    }
  }
}

function parseRssXmlItems(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(xmlText || ""), "text/xml");
  const nodes = Array.from(doc.querySelectorAll("item"));

  return nodes.map((node) => {
    const title = cleanText(node.querySelector("title")?.textContent) || "Pokemon TCG Update";
    const link = cleanText(node.querySelector("link")?.textContent) || NEWS_RSS_URL;
    const pubDateRaw = cleanText(node.querySelector("pubDate")?.textContent);
    const description = cleanText(node.querySelector("description")?.textContent);
    const source = cleanText(node.querySelector("source")?.textContent) || "Google News";

    return {
      title,
      link,
      source,
      pubDate: formatNewsDate(pubDateRaw),
      summary: description.length > 180 ? `${description.slice(0, 177)}...` : description,
      image: "",
    };
  });
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
        <button class="btn ghost small" data-action="clear-cover" type="button">Clear Cover Image</button>
      </div>

      <div class="cover-preview" style="background-image:${binder.coverImage ? `linear-gradient(rgba(3,12,22,.28), rgba(3,12,22,.55)), url(${binder.coverImage})` : `linear-gradient(120deg, ${coverA}, ${coverB})`}">${escapeHtml(coverTitle)}</div>
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
        </div>
        <button class="btn ghost small" data-action="theme-apply-all" type="button">Apply This Style To All Pages</button>
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
    const clearCoverBtn = wrap.querySelector('button[data-action="clear-cover"]');
    const themePageSelect = wrap.querySelector('select[data-action="theme-page"]');
    const themeMethodSelect = wrap.querySelector('select[data-action="theme-method"]');
    const themePatternSelect = wrap.querySelector('select[data-action="theme-pattern"]');
    const themeTintInput = wrap.querySelector('input[data-action="theme-tint"]');
    const themeSleeveInput = wrap.querySelector('input[data-action="theme-sleeve"]');
    const themeStrengthInput = wrap.querySelector('input[data-action="theme-strength"]');
    const themeApplyAllBtn = wrap.querySelector('button[data-action="theme-apply-all"]');

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
      pageMethodDefault: cleanText(binder.pageMethodDefault) || "classic",
      pageThemes: binder.pageThemes && typeof binder.pageThemes === "object" ? binder.pageThemes : {},
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
    if (countCardsInPage(binderId, page) < 9) {
      return page;
    }
  }

  binder.pages += 1;
  return binder.pages;
}

function countCardsInPage(binderId, page) {
  return state.cards.filter((card) => card.binderId === binderId && Number(card.page || 1) === page).length;
}

function getNextSlotOrder(binderId, page) {
  const taken = new Set(
    state.cards
      .filter((card) => card.binderId === binderId && Number(card.page || 1) === page)
      .map((card) => Number(card.slotOrder) || 0),
  );
  for (let slot = 1; slot <= 9; slot += 1) {
    if (!taken.has(slot)) return slot;
  }
  return 9;
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
    if (currentBinderId !== binderId && countCardsInPage(binderId, Number(page)) >= 9) {
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

  if (countCardsInPage(binderId, safeTarget) >= 9) {
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
