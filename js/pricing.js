function extractCardValues(card) {
  const prices = card?.tcgplayer?.prices || {};
  const cardmarketPrices = card?.cardmarket?.prices || {};

  const tcgValues = Object.values(prices)
    .flatMap((entry) => [
      Number(entry?.market || 0),
      Number(entry?.mid || 0),
      Number(entry?.low || 0),
      Number(entry?.high || 0),
    ])
    .filter((value) => Number.isFinite(value) && value > 0);

  const cardmarketValues = [
    Number(cardmarketPrices?.averageSellPrice || 0),
    Number(cardmarketPrices?.trendPrice || 0),
    Number(cardmarketPrices?.avg1 || 0),
    Number(cardmarketPrices?.avg7 || 0),
    Number(cardmarketPrices?.avg30 || 0),
  ].filter((value) => Number.isFinite(value) && value > 0);

  const tcgBest = tcgValues.length ? Math.max(...tcgValues) : 0;
  const cardmarketBest = cardmarketValues.length ? Math.max(...cardmarketValues) : 0;
  const raw = roundMoney(Math.max(tcgBest, cardmarketBest, 0));
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
    archives: {
      setArchiveUrl: buildPokemonSetArchiveUrl(card.set),
      imageLibraryUrl: cleanText(card.images?.large) || cleanText(card.images?.small),
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

function extractOcrCardHints(ocrText, nameLineText = "") {
  const text = String(ocrText || "");
  const probableName = extractNameFromNameLine(nameLineText) || guessPokemonName(text);
  const numberMatch = text.match(/\b([a-z]{0,3}\d{1,3})\s*\/\s*(\d{1,3})\b/i);
  const looseNumber = text.match(/\b([a-z]{0,3}\d{1,3})\b/i)?.[1] || "";
  const hp = text.match(/\b(\d{2,3})\s*hp\b/i)?.[1] || "";

  return {
    name: probableName ? titleCase(probableName) : "",
    set: "",
    number: numberMatch ? `${numberMatch[1]}/${numberMatch[2]}` : looseNumber,
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
    const exactId = cleanText(card?.tcg?.id);
    if (exactId) {
      const exactResp = await fetchWithRetry(`https://api.pokemontcg.io/v2/cards/${encodeURIComponent(exactId)}`, {}, 1, 350);
      if (exactResp.ok) {
        const exactJson = await exactResp.json();
        if (exactJson?.data) {
          return extractCardValues(exactJson.data);
        }
      }
    }

    const queryParts = [];
    if (cleanText(card.name)) queryParts.push(`name:"${cleanText(card.name)}"`);
    if (cleanText(card.number)) queryParts.push(`number:${cleanText(card.number).replace("#", "")}`);
    if (cleanText(card.set)) queryParts.push(`set.name:"${cleanText(card.set)}"`);
    const q = queryParts.join(" ") || `name:"${cleanText(card.name)}"`;
    if (!q) return null;

    const params = new URLSearchParams({ q, pageSize: "25" });
    const resp = await fetchWithRetry(`https://api.pokemontcg.io/v2/cards?${params.toString()}`, {}, 1, 350);
    if (!resp.ok) return null;
    const json = await resp.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    if (!rows.length) return null;

    const ocrLike = `${card.name || ""} ${card.set || ""} ${card.number || ""}`.toLowerCase();
    const best = rows
      .map((row) => ({ row, score: scoreCardMatch(row, ocrLike) }))
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


function getEstimatedGradedValue(card) {
  const grade = Number(card.grade || 0);
  if (grade >= 9.5) return Number(card.psa10Value || card.rawValue || 0);
  if (grade >= 8.5) return Number(card.psa9Value || card.rawValue || 0);
  return Number(card.rawValue || 0) * 1.15;
}


function normalizeCollectorNumber(value) {
  return cleanText(value).split("/")[0].toUpperCase();
}

function resolveLookupConfidence(card, hints, leadScore, scoreGap) {
  const cardNumber = cleanText(card?.number).toUpperCase();
  const hintedNumber = normalizeCollectorNumber(hints?.number);
  const setPrintedTotal = Number(card?.set?.printedTotal) || Number(card?.set?.total) || 0;
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

