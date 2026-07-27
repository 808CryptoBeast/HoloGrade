function exportBackup() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state: {
      cards: state.cards,
      removedCards: state.removedCards,
      removedBinders: state.removedBinders,
      binders: state.binders,
      profile: state.profile,
      activeTheme: state.activeTheme,
      activeTab: state.activeTab,
      news: state.news,
      newsFetchedAt: state.newsFetchedAt,
      pricesRecalculatedAt: state.pricesRecalculatedAt,
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
    state.removedCards = Array.isArray(next.removedCards) ? next.removedCards : [];
    state.removedBinders = Array.isArray(next.removedBinders) ? next.removedBinders : [];
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
    state.pricesRecalculatedAt = Number(next.pricesRecalculatedAt) || 0;
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


function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.cards)) state.cards = parsed.cards;
    if (Array.isArray(parsed.removedCards)) state.removedCards = parsed.removedCards;
    if (Array.isArray(parsed.removedBinders)) state.removedBinders = parsed.removedBinders;
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
    if (parsed.pricesRecalculatedAt) state.pricesRecalculatedAt = Number(parsed.pricesRecalculatedAt) || 0;
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
    removedCards: state.removedCards,
    removedBinders: state.removedBinders,
    binders: state.binders,
    profile: state.profile,
    activeTheme: state.activeTheme,
    activeTab: state.activeTab,
    news: state.news,
    newsFetchedAt: state.newsFetchedAt,
    pricesRecalculatedAt: state.pricesRecalculatedAt,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    status("Could not save — your browser's storage is full. Try removing a large video panel or image.");
  }
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
          backgroundImageFit: ["cover", "contain", "stretch"].includes(cleanText(theme?.backgroundImageFit)) ? cleanText(theme?.backgroundImageFit) : "cover",
          backgroundImageZoom: clamp(Number(theme?.backgroundImageZoom) || 100, 60, 260),
          backgroundImageFocusX: clamp(Number(theme?.backgroundImageFocusX) || 50, 0, 100),
          backgroundImageFocusY: clamp(Number(theme?.backgroundImageFocusY) || 50, 0, 100),
          cardScale: clamp(Number(theme?.cardScale) || Number(binder?.cardScale) || 86, 65, 120),
          cardGap: clamp(Number(theme?.cardGap) || Number(binder?.cardGap) || 8, 4, 18),
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
      coverSubtitle: cleanText(binder.coverSubtitle),
      coverTitleScale: clamp(Number(binder.coverTitleScale) || 100, 70, 150),
      coverColorA: hexSafe(binder.coverColorA, a),
      coverColorB: hexSafe(binder.coverColorB, b),
      sleeveColor: hexSafe(binder.sleeveColor, "#9cdfff"),
      pageTint: hexSafe(binder.pageTint, "#0f1d2f"),
      coverImage: binder.coverImage || "",
      coverImageScale: clamp(Number(binder.coverImageScale) || 100, 70, 220),
      coverImageFocusX: clamp(Number(binder.coverImageFocusX) || 50, 0, 100),
      coverImageFocusY: clamp(Number(binder.coverImageFocusY) || 50, 0, 100),
      cardScale: clamp(Number(binder.cardScale) || 86, 65, 120),
      cardGap: clamp(Number(binder.cardGap) || 8, 4, 18),
      compactList: !!binder.compactList,
      clickMoveEnabled: !!binder.clickMoveEnabled,
      lockCardArtFrame: !!binder.lockCardArtFrame,
      cardImageFit: ["cover", "contain", "stretch"].includes(cleanText(binder.cardImageFit)) ? cleanText(binder.cardImageFit) : "cover",
      cardImageZoom: clamp(Number(binder.cardImageZoom) || 100, 80, 180),
      cardImageFocusX: clamp(Number(binder.cardImageFocusX) || 50, 0, 100),
      cardImageFocusY: clamp(Number(binder.cardImageFocusY) || 50, 0, 100),
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


init();

