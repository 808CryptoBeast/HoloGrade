
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
  const preferredTab = state.activeTab === "portfolio" ? "collection" : (state.activeTab || "scan");
  setTab(preferredTab);
}

function setTab(tabName) {
  const safeTab = tabName === "portfolio" ? "collection" : tabName;
  const panelExists = Array.from(els.panels).some((panel) => panel.id === `tab-${safeTab}`);
  const nextTab = panelExists ? safeTab : "collection";
  state.activeTab = nextTab;
  els.tabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === nextTab);
  });
  els.panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${nextTab}`);
  });
  if (nextTab !== "scan") {
    stopCamera();
  }
  if (nextTab !== "collection") {
    closeBinderBook();
  }
  if (nextTab === "collection") {
    renderPortfolio();
  }
  if (nextTab === "dashboard") {
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
  els.cardDetailFlip?.addEventListener("click", () => {
    els.cardDetailFlip.classList.toggle("flipped");
  });
  els.cardDetailRemoveBtn?.addEventListener("click", () => {
    if (!runtime.activeDetailCardId) return;
    const card = state.cards.find((item) => item.id === runtime.activeDetailCardId);
    if (!card) return;
    const ok = window.confirm(`Remove ${card.name} from your binder?`);
    if (!ok) return;
    archiveRemovedCard(card, "modal-remove");
    state.cards = state.cards.filter((item) => item.id !== card.id);
    closeCardDetailModal();
    persist();
    renderCollection();
    renderBinderManager();
    status(`${card.name} removed.`);
  });
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
  if (!els.saveProfileBtn || !els.profileName || !els.profileFavorite || !els.profileBio || !els.exportDataBtn || !els.importDataInput || !els.recalcPricesBtn) {
    return;
  }
  els.saveProfileBtn.addEventListener("click", () => {
    state.profile.name = cleanText(els.profileName.value) || "Collector";
    state.profile.favorite = cleanText(els.profileFavorite.value);
    state.profile.bio = cleanText(els.profileBio.value);
    persist();
    renderPortfolio();
    status("Profile saved.");
  });
  els.recalcPricesBtn.addEventListener("click", recalculateAllCardValues);
  els.exportDataBtn.addEventListener("click", exportBackup);
  els.importDataInput.addEventListener("change", importBackup);
}

function renderPortfolio() {
  if (!els.profileName) return;

  if (els.pricesUpdatedLabel) {
    if (state.pricesRecalculatedAt) {
      const ageMin = Math.max(0, Math.round((Date.now() - state.pricesRecalculatedAt) / 60000));
      els.pricesUpdatedLabel.textContent = ageMin < 1 ? "Prices updated just now" : `Prices updated ${ageMin}m ago`;
    } else {
      els.pricesUpdatedLabel.textContent = "Not priced yet";
    }
  }

  els.profileName.value = state.profile.name || "";
  els.profileFavorite.value = state.profile.favorite || "";
  els.profileBio.value = state.profile.bio || "";

  // Pricing (raw/graded value totals, P/L) is paused for now — see
  // analysisValues in scan.js — so the snapshot leads with collection and
  // condition stats instead of dollar totals.
  const total = state.cards.length;
  const avgGrade = total ? state.cards.reduce((sum, c) => sum + (Number(c.grade) || 0), 0) / total : 0;
  const topCard = [...state.cards].sort((a, b) => (Number(b.grade) || 0) - (Number(a.grade) || 0))[0];

  els.portfolioStats.innerHTML = `
    <div><span>Collector</span><strong>${escapeHtml(state.profile.name || "Collector")}</strong></div>
    <div><span>Total Cards</span><strong>${total}</strong></div>
    <div><span>Avg Grade</span><strong>${total ? avgGrade.toFixed(2) : "-"}</strong></div>
    <div><span>Binders</span><strong>${state.binders.length}</strong></div>
  `;

  const notes = [
    state.profile.favorite ? `Favorite Pokemon: ${state.profile.favorite}` : "Set your favorite Pokemon in your profile.",
    state.profile.bio ? state.profile.bio : "Add a short collector bio.",
    topCard ? `Top graded card: ${topCard.name} (EST ${Number(topCard.grade).toFixed(1)})` : "Scan a card to build portfolio highlights.",
  ];

  els.portfolioHighlights.innerHTML = `<p>${notes.map((n) => escapeHtml(n)).join("<br />")}</p>`;

  const breakdown = state.binders.map((binder) => ({
    binder,
    count: state.cards.filter((c) => c.binderId === binder.id).length,
  }));

  els.portfolioBinderBreakdown.innerHTML = breakdown.map(({ binder, count }) => `
    <div class="binder-breakdown-item">
      <strong>${escapeHtml(binder.coverTitle || binder.name)}</strong>
      <p>${count} card${count === 1 ? "" : "s"}</p>
    </div>
  `).join("");
}


function applyTheme(themeName) {
  APP_THEMES.forEach((name) => {
    els.app.classList.remove(name);
  });
  els.app.classList.add(themeName);
  state.activeTheme = themeName;
}


function renderDashboard() {
  const latest = [...state.cards].sort((a, b) => b.addedAt - a.addedAt)[0];
  const topBinder = state.binders
    .map((binder) => ({
      binder,
      count: state.cards.filter((c) => c.binderId === binder.id).length,
    }))
    .sort((a, b) => b.count - a.count)[0];
  // Pricing is paused for now (see analysisValues in scan.js), so the
  // dashboard leads with collection/condition stats instead of dollar totals.
  const avgGrade = state.cards.length
    ? state.cards.reduce((sum, c) => sum + (Number(c.grade) || 0), 0) / state.cards.length
    : 0;

  els.dashboardSummary.innerHTML = `
    <div><span>Total Cards</span><strong>${state.cards.length}</strong></div>
    <div><span>Binders</span><strong>${state.binders.length}</strong></div>
    <div><span>Avg Grade</span><strong>${state.cards.length ? avgGrade.toFixed(2) : "-"}</strong></div>
  `;

  const hasBinder = state.binders.length > 0;
  const hasCard = state.cards.length > 0;
  const hasCustomization = state.binders.some((binder) => Object.values(binder.pageThemes || {}).some((theme) =>
    (theme.scenePanels || []).length > 0 || cleanText(theme.backgroundImage) || (theme.decorations || []).length > 0));
  const onboardingSteps = [
    { done: hasBinder, label: "Create a binder" },
    { done: hasCard, label: "Scan your first card" },
    { done: hasCustomization, label: "Customize a page — art, scene panels, or stickers" },
  ];
  const onboardingHtml = onboardingSteps.some((step) => !step.done)
    ? `<ul class="onboarding-checklist">${onboardingSteps
      .map((step) => `<li class="${step.done ? "done" : ""}">${step.done ? "✓" : "☐"} ${escapeHtml(step.label)}</li>`)
      .join("")}</ul>`
    : "";

  const spotlightLines = [
    latest ? `Latest add: ${latest.name} into ${getBinderLabel(latest.binderId)} on page ${latest.page || 1}.` : "Scan your first card to start the collection.",
    topBinder && topBinder.count ? `Top binder: ${topBinder.binder.coverTitle || topBinder.binder.name} with ${topBinder.count} cards.` : "Create binders to organize your collection.",
    state.news.length ? `Latest headline: ${state.news[0].title}` : "News feed will show recent Pokemon TCG headlines here.",
  ];
  els.dashboardSpotlight.innerHTML = `${onboardingHtml}<p>${spotlightLines.map((line) => escapeHtml(line)).join("<br />")}</p>`;
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
  runtime.activeDetailCardId = card.id;
  const binderName = cleanText(context.binderName) || getBinderLabel(card.binderId);
  const page = Number(context.page || card.page || 1);
  const slot = Number(context.slot || card.slotOrder || 0);

  els.cardDetailContext.textContent = `${binderName} · Page ${page}${slot ? ` · Slot ${slot}` : ""}`;
  els.cardDetailTitle.textContent = card.name || "Card Details";
  els.cardDetailImage.src = card.image || "";
  els.cardDetailFlip?.classList.remove("flipped");
  if (els.cardDetailBackName) els.cardDetailBackName.textContent = card.name || "HoloGrade";
  els.cardDetailName.textContent = card.name || "Unknown Card";
  els.cardDetailMeta.textContent = [card.set, card.number && `#${card.number}`, card.rarity].filter(Boolean).join(" · ") || "Card metadata pending";

  // Pricing display is paused for now (see analysisValues in scan.js) —
  // rawValue/psa9Value/psa10Value are still stored on the card, just not shown.
  els.cardDetailGradeRow.innerHTML = `
    <div title="${CONDITION_ESTIMATE_TOOLTIP}"><span>Grade (est.)</span><strong>${Number(card.grade || 0).toFixed(1)}</strong></div>
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
  runtime.activeDetailCardId = null;
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

