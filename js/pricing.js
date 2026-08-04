function extractCardValues(card) {
  // TCGdex embeds pricing directly on the card: card.pricing.tcgplayer is
  // keyed by print variant (normal/holofoil/reverse-holofoil/...), each a
  // {lowPrice,midPrice,highPrice,marketPrice,directLowPrice} object, plus
  // "unit"/"updated" keys to skip. card.pricing.cardmarket is a flat set of
  // EUR price fields (plus "-holo" variants).
  const tcgplayer = card?.pricing?.tcgplayer || {};
  const cardmarket = card?.pricing?.cardmarket || {};

  const tcgValues = Object.entries(tcgplayer)
    .filter(([key]) => key !== "unit" && key !== "updated")
    .flatMap(([, entry]) => [
      Number(entry?.marketPrice || 0),
      Number(entry?.midPrice || 0),
      Number(entry?.lowPrice || 0),
      Number(entry?.highPrice || 0),
    ])
    .filter((value) => Number.isFinite(value) && value > 0);

  const cardmarketValues = [
    Number(cardmarket?.avg || 0),
    Number(cardmarket?.trend || 0),
    Number(cardmarket?.avg1 || 0),
    Number(cardmarket?.avg7 || 0),
    Number(cardmarket?.avg30 || 0),
  ].filter((value) => Number.isFinite(value) && value > 0);

  const tcgBest = tcgValues.length ? Math.max(...tcgValues) : 0;
  const cardmarketBest = cardmarketValues.length ? Math.max(...cardmarketValues) : 0;
  const raw = roundMoney(Math.max(tcgBest, cardmarketBest, 0));
  return estimateFallbackValues(raw);
}

function extractAutoCardData(card) {
  if (!card || typeof card !== "object") return {};

  const imageBase = cleanText(card.image);

  return {
    name: cleanText(card.name),
    set: cleanText(card.set?.name),
    number: cleanText(card.localId),
    rarity: cleanText(card.rarity),
    supertype: cleanText(card.category),
    // TCGdex doesn't model subtypes as a flat array the way pokemontcg.io
    // did — approximate with whatever stage info is present.
    subtypes: asCleanStringArray([card.stage, card.suffix]),
    hp: cleanText(card.hp),
    types: asCleanStringArray(card.types),
    evolvesFrom: cleanText(card.evolveFrom),
    evolvesTo: [],
    abilities: Array.isArray(card.abilities)
      ? card.abilities
        .map((ability) => ({
          name: cleanText(ability?.name),
          text: cleanText(ability?.effect),
          type: cleanText(ability?.type),
        }))
        .filter((ability) => ability.name || ability.text || ability.type)
      : [],
    attacks: Array.isArray(card.attacks)
      ? card.attacks
        .map((attack) => ({
          name: cleanText(attack?.name),
          text: cleanText(attack?.effect),
          damage: cleanText(attack?.damage),
          cost: asCleanStringArray(attack?.cost),
          convertedEnergyCost: Array.isArray(attack?.cost) ? attack.cost.length : 0,
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
    // TCGdex only gives the numeric retreat cost, not the array of energy
    // types pokemontcg.io provided.
    retreatCost: [],
    convertedRetreatCost: Number(card.retreat) || 0,
    artist: cleanText(card.illustrator),
    flavorText: cleanText(card.description),
    regulationMark: "",
    rules: [],
    legalities: card.legal && typeof card.legal === "object" ? {
      unlimited: "",
      expanded: cleanText(String(card.legal.expanded ?? "")),
      standard: cleanText(String(card.legal.standard ?? "")),
    } : {},
    nationalPokedexNumbers: Array.isArray(card.dexId)
      ? card.dexId.filter((n) => Number.isFinite(Number(n))).map((n) => Number(n))
      : [],
    images: {
      small: imageBase ? `${imageBase}/low.png` : "",
      large: imageBase ? `${imageBase}/high.png` : "",
    },
    archives: {
      setArchiveUrl: buildPokemonSetArchiveUrl(card.set),
      imageLibraryUrl: imageBase ? `${imageBase}/high.png` : "",
    },
    tcg: {
      id: cleanText(card.id),
      setId: cleanText(card.set?.id),
      setSeries: "",
      setTotal: Number(card.set?.cardCount?.total) || 0,
      setPrintedTotal: Number(card.set?.cardCount?.official) || 0,
      releaseDate: "",
      ptcgoCode: "",
      tcgplayerUrl: "",
      cardmarketUrl: "",
    },
  };
}

function extractOcrCardHints(ocrText, nameLineText = "", numberLineText = "") {
  const text = String(ocrText || "");
  const probableName = extractNameFromNameLine(nameLineText) || guessPokemonName(text);
  const fractionPattern = /\b([a-z]{0,3}\d{1,3})\s*\/\s*(\d{1,3})\b/i;
  // The dedicated bottom-strip OCR pass is cropped tightly to the collector
  // number's usual location, so it's checked first. A short number-like
  // token found anywhere in the full card text (HP, attack damage, weakness,
  // retreat cost, the Pokedex "LV. NN #N" reference line) is not trustworthy
  // enough to stand in for the actual collector number — better to leave it
  // blank than to confidently assert a wrong one.
  const numberMatch = String(numberLineText || "").match(fractionPattern) || text.match(fractionPattern);
  const hp = text.match(/\b(\d{2,3})\s*hp\b/i)?.[1] || "";

  return {
    name: probableName ? titleCase(probableName) : "",
    set: "",
    number: numberMatch ? `${numberMatch[1]}/${numberMatch[2]}` : "",
    rarity: "",
    hp,
  };
}


async function recalculateAllCardValues() {
  if (runtime.repricing) return;
  if (!state.cards.length) {
    status("No cards to recalculate.");
    return;
  }

  runtime.repricing = true;
  els.recalcPricesBtn.disabled = true;
  const originalLabel = els.recalcPricesBtn.textContent;
  els.recalcPricesBtn.textContent = "Repricing...";

  let updated = 0;
  let failed = 0;

  try {
    for (let i = 0; i < state.cards.length; i += 1) {
      const card = state.cards[i];
      status(`Repricing ${i + 1}/${state.cards.length}: ${card.name}`);
      const freshValues = await fetchCardValuesForExistingCard(card);
      if (!freshValues) {
        failed += 1;
        continue;
      }

      const stabilized = stabilizeRepricedValues(card, freshValues);
      state.cards = state.cards.map((item) => item.id === card.id
        ? {
          ...item,
          rawValue: stabilized.raw,
          psa9Value: stabilized.psa9,
          psa10Value: stabilized.psa10,
        }
        : item);
      updated += 1;
    }

    if (updated) state.pricesRecalculatedAt = Date.now();
    persist();
    renderCollection();
    renderPortfolio();
    status(`Repricing complete. Updated ${updated} cards${failed ? `, ${failed} skipped` : ""}.`);
  } finally {
    runtime.repricing = false;
    els.recalcPricesBtn.disabled = false;
    els.recalcPricesBtn.textContent = originalLabel;
  }
}

async function fetchCardValuesForExistingCard(card) {
  try {
    // Cards saved before the TCGdex migration carry a pokemontcg.io-shaped
    // id (e.g. "base1-4") which simply won't resolve here — tcgdexGetCard
    // returns null and this falls through to the name/number search below.
    const exactId = cleanText(card?.tcg?.id);
    if (exactId) {
      const exactCard = await tcgdexGetCard(exactId);
      if (exactCard) return extractCardValues(exactCard);
    }

    const hintedNumber = normalizeCollectorNumber(card.number);
    const briefs = await tcgdexSearchCards({ name: cleanText(card.name), localId: hintedNumber });
    if (!briefs.length) return null;

    const shortlist = coarseRankBriefCandidates(briefs, card.name, hintedNumber).slice(0, 5);
    const fullCards = (await Promise.all(
      shortlist.map((brief) => tcgdexGetCard(brief.id).catch(() => null)),
    )).filter(Boolean);
    if (!fullCards.length) return null;

    const ocrLike = `${card.name || ""} ${card.set || ""} ${card.number || ""}`.toLowerCase();
    const best = fullCards
      .map((row) => ({ row, score: scoreCardMatch(row, ocrLike, { number: card.number, hp: card.hp }) }))
      .sort((a, b) => b.score - a.score)[0]?.row;
    if (!best) return null;
    return extractCardValues(best);
  } catch {
    return null;
  }
}

function stabilizeRepricedValues(existingCard, nextValues) {
  const raw = Number(nextValues?.raw || 0);
  const psa9 = Number(nextValues?.psa9 || 0);
  const psa10 = Number(nextValues?.psa10 || 0);
  const oldRaw = Number(existingCard?.rawValue || 0);

  // If raw comes back unrealistically low for a premium/high-grade card, keep the better prior baseline.
  const premiumSignal = /charizard|mew|mewtwo|lugia|umbreon|rayquaza|pikachu/i.test(cleanText(existingCard?.name));
  const highGrade = Number(existingCard?.grade || 0) >= 9;
  const suspiciousLowRaw = raw > 0 && oldRaw > 0 && raw < oldRaw * 0.35;
  const protectedRaw = (premiumSignal || highGrade) && suspiciousLowRaw ? oldRaw : raw;

  return estimateFallbackValues(Math.max(protectedRaw, 0, raw, oldRaw * 0.15));
}


function normalizeCollectorNumber(value) {
  return cleanText(value).split("/")[0].toUpperCase();
}

function resolveLookupConfidence(card, hints, leadScore, scoreGap) {
  const cardNumber = cleanText(card?.localId).toUpperCase();
  const hintedNumber = normalizeCollectorNumber(hints?.number);
  const setPrintedTotal = Number(card?.set?.cardCount?.official) || Number(card?.set?.cardCount?.total) || 0;
  const hintedTotal = Number(cleanText(hints?.number).split("/")[1] || 0);
  const numberMatched = !hintedNumber || !cardNumber ? false : cardNumber.toUpperCase() === hintedNumber;
  const totalMatched = !hintedTotal || !setPrintedTotal ? false : hintedTotal === setPrintedTotal;

  if (numberMatched && totalMatched && leadScore >= 125 && scoreGap >= 24) return "high";
  if ((numberMatched || totalMatched) && leadScore >= 96) return "medium";
  if (leadScore >= 82 && scoreGap >= 14) return "medium";
  return "low";
}

function buildPokemonSetArchiveUrl(set) {
  const setName = encodeURIComponent(cleanText(set?.name));
  if (!setName) return "";
  return `https://www.pokemon.com/us/pokemon-tcg/trading-card-expansions/?q=${setName}`;
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


async function fetchWithRetry(url, options = {}, retries = 1, delayMs = 350) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok || attempt === retries) return resp;
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw lastError || new Error("fetchWithRetry failed");
}

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en";

// The list endpoint only returns brief objects ({id, localId, name} — no
// set/hp/pricing/abilities), unlike pokemontcg.io's search which returned
// full records. That's intentional here: search stays cheap and broad, then
// tcgdexGetCard() fetches full detail only for the shortlist worth scoring.
async function tcgdexSearchCards(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (cleanText(value)) query.set(key, value);
  });
  const url = `${TCGDEX_BASE}/cards?${query.toString()}`;
  const resp = await fetchWithRetry(url, {}, 1, 350);
  if (!resp.ok) throw new Error(`TCGdex search failed (${resp.status})`);
  const json = await resp.json();
  return Array.isArray(json) ? json : [];
}

async function tcgdexGetCard(id) {
  if (!cleanText(id)) return null;
  const resp = await fetchWithRetry(`${TCGDEX_BASE}/cards/${encodeURIComponent(id)}`, {}, 1, 350);
  if (!resp.ok) return null;
  const json = await resp.json();
  return json && typeof json === "object" ? json : null;
}


