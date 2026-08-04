function wireScan() {
  els.startCameraBtn.addEventListener("click", async () => {
    await openCamera();
  });

  els.cancelCameraBtn.addEventListener("click", () => {
    stopCamera();
    status("Camera closed.");
  });

  els.switchCameraBtn.addEventListener("click", switchCamera);

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
  els.manualSearchBtn.addEventListener("click", runManualSearch);
}

// Standalone fallback for when OCR can't get a usable read (or the user just
// wants to look a card up directly): reuses identifyCard's own query/scoring
// pipeline via scanHints, and the same buildAnalysisResult/renderResult/save
// flow as an OCR-driven scan. Works with or without a photo already loaded.
async function runManualSearch() {
  const name = cleanText(els.manualSearchName.value);
  const number = cleanText(els.manualSearchNumber.value);
  const set = cleanText(els.manualSearchSet.value);

  if (!name && !number) {
    status("Enter at least a card name or number to search.");
    return;
  }

  if (runtime.scanBusy) {
    status("Still working on the previous request — please wait.");
    return;
  }

  runtime.scanBusy = true;
  els.manualSearchBtn.disabled = true;
  status("Searching card archives...");

  try {
    const cardInfo = await identifyCard("", { name, number, set, rarity: "" }, "", number);
    const quality = runtime.imageBitmap
      ? estimateCondition(runtime.imageBitmap)
      : { centering: 0, corners: 0, edges: 0, surface: 0, grade: 0 };
    const analysis = buildAnalysisResult(quality, cardInfo, "");
    state.analysis = analysis;
    renderResult(analysis);
    els.resultPanel.scrollIntoView?.({ behavior: "smooth", block: "start" });
    status(cardInfo.found
      ? `Found ${analysis.name}. Review and save when ready.`
      : "No confident match found for that search. Try different terms, or edit the fields below directly.");
  } finally {
    runtime.scanBusy = false;
    els.manualSearchBtn.disabled = false;
  }
}

// Tried in order, most-specific first. Some devices/browsers reject the
// `advanced` capability constraints or a specific facingMode/resolution
// combination (OverconstrainedError) — falling back to plainer constraints
// turns a hard failure into a working, just-less-optimized camera.
function buildCameraConstraints(deviceId) {
  if (deviceId) {
    return [{ video: { deviceId: { exact: deviceId } }, audio: false }];
  }
  return [
    {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        advanced: [
          { focusMode: "continuous" },
          { exposureMode: "continuous" },
          { whiteBalanceMode: "continuous" },
        ],
      },
      audio: false,
    },
    { video: { facingMode: { ideal: "environment" } }, audio: false },
    { video: true, audio: false },
  ];
}

async function requestCameraStream(deviceId) {
  const attempts = buildCameraConstraints(deviceId);
  let lastError = null;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
      console.warn("getUserMedia attempt failed, trying next fallback:", error);
    }
  }
  throw lastError || new Error("Could not open camera");
}

async function openCamera(deviceId) {
  if (!window.isSecureContext) {
    status("Camera requires a secure page (HTTPS or localhost). Upload photo or run with a local server.");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    status("Camera is not supported on this browser. Use upload instead.");
    return;
  }

  try {
    const stream = await requestCameraStream(deviceId);

    runtime.stream = stream;
    await optimizeCameraTrack(stream.getVideoTracks()[0]);
    els.cameraVideo.srcObject = stream;
    els.cameraBox.classList.remove("hidden");
    runtime.scanState = "camera-active";
    status("Camera ready. Place the full card inside the guide for auto-crop.");

    await refreshCameraDeviceList();
  } catch (error) {
    console.error("Camera open failed:", error);
    const message = error?.name === "NotAllowedError"
      ? "Camera permission was denied. Allow camera access in your browser settings, or upload a photo instead."
      : error?.name === "NotFoundError"
        ? "No camera was found on this device. Use upload photo instead."
        : "Camera unavailable right now. Use upload photo instead.";
    status(message);
  }
}

// Populates runtime.videoDevices and reveals the Switch Camera button when
// more than one camera is available. Device labels are only populated after
// permission has been granted, so this runs after a successful open.
async function refreshCameraDeviceList() {
  if (!navigator.mediaDevices?.enumerateDevices || !els.switchCameraBtn) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    runtime.videoDevices = devices.filter((device) => device.kind === "videoinput");
    els.switchCameraBtn.classList.toggle("hidden", runtime.videoDevices.length < 2);
  } catch (error) {
    console.warn("Could not enumerate camera devices:", error);
  }
}

async function switchCamera() {
  if (runtime.videoDevices.length < 2) return;
  runtime.videoDeviceIndex = (runtime.videoDeviceIndex + 1) % runtime.videoDevices.length;
  const nextDevice = runtime.videoDevices[runtime.videoDeviceIndex];
  stopCamera();
  status("Switching camera...");
  await openCamera(nextDevice?.deviceId);
}

function stopCamera() {
  if (runtime.stream) {
    runtime.stream.getTracks().forEach((track) => track.stop());
    runtime.stream = null;
  }
  els.cameraBox.classList.add("hidden");
  if (runtime.scanState === "camera-active") {
    runtime.scanState = "idle";
  }
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
  runtime.imageBitmap = await dataUrlToBitmap(dataUrl);
  els.previewImage.src = dataUrl;
  els.previewWrap.classList.remove("hidden");
  els.scanStart.classList.add("hidden");
  state.analysis = null;
  runtime.scanState = "image-ready";
  renderResult(null);
}

async function analyzeCurrentImage() {
  if (!runtime.imageBitmap || !runtime.imageDataUrl) {
    status("Add a card image first.");
    return;
  }
  if (runtime.scanBusy) {
    status("Still analyzing the previous photo — please wait.");
    return;
  }

  runtime.scanBusy = true;
  runtime.scanState = "analyzing";
  els.analyzeBtn.disabled = true;

  try {
    status("Detecting card edges and preparing scan...");
    const prepared = await prepareScanForAnalysis(runtime.imageDataUrl);

    status("Analyzing card condition...");
    const quality = estimateCondition(prepared.imageBitmap);
    const qualityWarnings = assessImageQuality(prepared.imageBitmap, quality, prepared.cropDetected);

    status("Reading card text with OCR...");
    const ocr = await runOcr(prepared.dataUrl, runtime.imageDataUrl);

    status("Matching against known card archives...");
    const cardInfo = await identifyCard(ocr.text, prepared.hints, ocr.nameLine, ocr.numberLine);

    const analysis = buildAnalysisResult(quality, cardInfo, ocr.text);
    state.analysis = analysis;
    renderResult(analysis);
    runtime.imageDataUrl = prepared.dataUrl;
    runtime.imageBitmap = prepared.imageBitmap;
    runtime.scanState = "result";

    const cropNote = prepared.cropDetected ? "Auto-crop locked onto the card." : "Auto-crop could not fully lock, so the original frame was used.";
    const apiNote = cardInfo.apiError ? " Card archive was unreliable during lookup, so this match may be incomplete — try Analyze again." : "";
    const qualityNote = qualityWarnings.length
      ? ` Heads up: ${qualityWarnings.join(", ")} — you can still save, but consider retaking for a more accurate result.`
      : "";
    status(`Analysis complete. ${cropNote}${apiNote}${qualityNote} Confidence: ${analysis.confidence}. Review before saving.`);
  } catch (error) {
    console.error("Analyze failed:", error);
    runtime.scanState = "error";
    status("Something went wrong analyzing this photo. Try again, or use manual search below.");
  } finally {
    runtime.scanBusy = false;
    els.analyzeBtn.disabled = false;
  }
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
    // Raw signals (not shown as subgrades) reused by assessImageQuality()
    // for pre-flight blur/brightness warnings.
    sharpness,
    brightness: averageLuminance(centerBox),
  };
}

function averageLuminance(values) {
  if (!values.length) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) sum += values[i];
  return sum / values.length;
}

// Non-blocking pre-flight checks: these only ever add a warning to the status
// line, they never stop analysis from running. Thresholds are intentionally
// conservative (favor missing a marginal issue over nagging on a fine photo).
function assessImageQuality(imageBitmap, quality, cropDetected) {
  const warnings = [];

  if (imageBitmap.width < 400 || imageBitmap.height < 400) {
    warnings.push("photo resolution is quite low");
  }
  if (quality.sharpness < 0.03) {
    warnings.push("photo looks blurry");
  }
  if (quality.brightness < 40) {
    warnings.push("photo looks too dark");
  } else if (quality.brightness > 235) {
    warnings.push("photo looks overexposed");
  }
  if (!cropDetected) {
    warnings.push("couldn't clearly find the card's edges — try filling more of the frame");
  }

  return warnings;
}

async function runOcr(dataUrl, fallbackDataUrl = "") {
  if (!window.Tesseract) return { text: "", nameLine: "", numberLine: "" };
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

    // A third pass on the bottom strip helps recover the collector number.
    const bottomStrip = await makeBottomStripDataUrl(dataUrl);
    const bottomResult = await window.Tesseract.recognize(bottomStrip, "eng");

    let fallbackResult = "";
    let fallbackNameLine = "";
    let fallbackNumberLine = "";
    if (fallbackDataUrl && fallbackDataUrl !== dataUrl) {
      const fallbackStrip = await makeTopStripDataUrl(fallbackDataUrl);
      const fallbackTop = await window.Tesseract.recognize(fallbackStrip, "eng");
      fallbackResult = fallbackTop?.data?.text || "";
      fallbackNameLine = fallbackResult;

      const fallbackBottomStrip = await makeBottomStripDataUrl(fallbackDataUrl);
      const fallbackBottom = await window.Tesseract.recognize(fallbackBottomStrip, "eng");
      fallbackNumberLine = fallbackBottom?.data?.text || "";
    }

    const text = [result?.data?.text || "", topResult?.data?.text || "", bottomResult?.data?.text || "", fallbackResult]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const nameLine = [topResult?.data?.text || "", fallbackNameLine].filter(Boolean).join("\n");
    const numberLine = [bottomResult?.data?.text || "", fallbackNumberLine].filter(Boolean).join("\n");

    return { text, nameLine, numberLine };
  } catch {
    return { text: "", nameLine: "", numberLine: "" };
  }
}

// The top-strip OCR pass is cropped tightly around the name/HP line, so parsing
// it directly (rather than matching a small hardcoded species list) works for
// any Pokemon name, not just the ones in that list.
function extractNameFromNameLine(nameLine) {
  const raw = String(nameLine || "");
  if (!raw.trim()) return "";

  // Also filters boilerplate that sits right next to the name in the
  // cropped strip: "Evolves from X" and "Put X on the Basic Pokemon card"
  // banners on evolution-stage cards.
  const noiseWords = new Set([
    "basic", "stage", "pokemon", "pokémon", "hp", "lv", "level",
    "evolves", "evolve", "from", "put", "the", "on", "card",
  ]);
  const lines = raw.split(/\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const words = line
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z'.-]/g, ""))
      // No official Pokemon name is shorter than 3 letters ("Mew", "Muk").
      // A surviving 1-2 letter fragment is essentially always OCR noise
      // (seen in practice: a badly-misread card producing "Vv" as "the
      // name") rather than a real short name, so it's worth the rare
      // false-negative on a genuinely 2-letter trainer/item card name.
      .filter((w) => w.length >= 3 && !noiseWords.has(w.toLowerCase()) && !/^\d+$/.test(w));

    // A real Pokemon/card name is essentially never more than 3 words. More
    // survivors than that is a sign this line is garbled OCR mixing several
    // banner/title elements together (seen in practice: "Evolves From
    // Charmander Pos Crarmelocr Bren Base Pokdmen") — better to try the next
    // line, or give up, than to confidently return a nonsense blob as "the
    // name" that then gets displayed as if it were a real finding.
    if (words.length >= 1 && words.length <= 3) {
      return words.join(" ").toLowerCase();
    }
  }

  return "";
}

async function identifyCard(ocrText, scanHints = {}, nameLineText = "", numberLineText = "") {
  const cleaned = sanitizeOcrText(ocrText);
  const probableName = extractNameFromNameLine(nameLineText) || guessPokemonName(cleaned) || cleanText(scanHints.name);
  const tokens = extractSearchTokens(cleaned);
  const ocrHints = { ...extractOcrCardHints(cleaned, nameLineText, numberLineText), ...scanHints };
  const collectorNumber = normalizeCollectorNumber(ocrHints.number);

  // A name (from the dedicated name-strip OCR pass) or a collector number
  // (from the dedicated number-strip pass) is required to search at all.
  // Loose body-text tokens alone are NOT enough of a signal to anchor a
  // search on — without a name/number, a fuzzy substring search on a random
  // 4+ character word misread from flavor text or an attack description can
  // confidently "win" against a completely unrelated card (seen in practice:
  // a blurry Charmeleon scan matched to an unrelated Trainer card). Tokens
  // still help as supplementary fallback queries below, just never alone.
  if (!probableName && !collectorNumber && !cleanText(scanHints.name)) {
    return {
      found: false,
      name: ocrHints.name || "Unknown Card",
      set: ocrHints.set || "Unknown Set",
      number: ocrHints.number || "",
      rarity: ocrHints.rarity || "",
      confidence: "low",
      autoRecord: ocrHints,
      candidates: [],
    };
  }

  // TCGdex's list endpoint only returns brief {id, localId, name} objects —
  // search broadly and cheaply here, then fetch full detail (pricing,
  // abilities, hp, set info) only for a short, pre-ranked shortlist. This
  // replaces the old pokemontcg.io Lucene-query approach; substring matching
  // is TCGdex's default filter behavior, so far fewer query variants are
  // needed than the old name:"X"/name:X/name:*X* trio.
  const briefQueries = [];
  if (probableName && collectorNumber) {
    briefQueries.push({ name: probableName, localId: collectorNumber });
  }
  if (probableName) {
    briefQueries.push({ name: probableName });
  }
  if (collectorNumber) {
    briefQueries.push({ localId: collectorNumber });
  }
  const coreQueryCount = briefQueries.length;
  tokens.slice(0, 4).forEach((token) => {
    briefQueries.push({ name: token });
  });

  const briefCandidates = [];
  const seenBrief = new Set();
  let apiError = false;

  try {
    for (let i = 0; i < briefQueries.length; i += 1) {
      let rows;
      try {
        rows = await tcgdexSearchCards(briefQueries[i]);
      } catch {
        apiError = true;
        continue;
      }
      rows.forEach((row) => {
        if (!row?.id || seenBrief.has(row.id)) return;
        seenBrief.add(row.id);
        briefCandidates.push(row);
      });
      if (briefCandidates.length >= 120) break;
      // Skip the remaining speculative token queries once the targeted
      // name/number queries already found a healthy candidate pool — this
      // is the main source of real-world latency (and API flakiness
      // exposure) on a successful, well-OCR'd scan.
      if (i + 1 === coreQueryCount && briefCandidates.length >= 15) break;
    }

    if (!briefCandidates.length) {
      return {
        found: false,
        name: ocrHints.name || titleCase(probableName || tokens[0] || "Unknown Card"),
        set: ocrHints.set || "Unknown Set",
        number: ocrHints.number || "",
        rarity: ocrHints.rarity || "",
        confidence: "medium",
        autoRecord: ocrHints,
        apiError,
        candidates: [],
      };
    }

    const shortlistBriefs = coarseRankBriefCandidates(briefCandidates, probableName, collectorNumber).slice(0, 10);
    const fullCards = (await Promise.all(
      shortlistBriefs.map((brief) => tcgdexGetCard(brief.id).catch(() => null)),
    )).filter(Boolean);

    if (!fullCards.length) {
      return {
        found: false,
        name: ocrHints.name || titleCase(probableName || tokens[0] || "Unknown Card"),
        set: ocrHints.set || "Unknown Set",
        number: ocrHints.number || "",
        rarity: ocrHints.rarity || "",
        confidence: "medium",
        autoRecord: ocrHints,
        apiError: true,
        candidates: [],
      };
    }

    const scored = fullCards
      .map((card) => ({ card, score: scoreCardMatch(card, cleaned, ocrHints) }))
      .sort((a, b) => b.score - a.score);

    const first = scored[0].card;
    const leadScore = Number(scored[0]?.score || 0);
    const secondScore = Number(scored[1]?.score || 0);
    const scoreGap = leadScore - secondScore;

    // Absolute floor, independent of confidence tiers: a genuine match (even
    // a low-confidence one) clears this easily via the name-inclusion bonus
    // or several fuzzy name-part hits. Anything scoring lower than this is
    // most likely a coincidental substring hit on garbled OCR text, not a
    // real candidate — presenting it (and 4 similarly-weak "alternatives")
    // as if it were a plausible finding is actively misleading.
    if (leadScore < 20) {
      return {
        found: false,
        name: ocrHints.name || titleCase(probableName || tokens[0] || "Unknown Card"),
        set: ocrHints.set || "Unknown Set",
        number: ocrHints.number || "",
        rarity: ocrHints.rarity || "",
        confidence: "low",
        autoRecord: ocrHints,
        apiError,
        candidates: [],
      };
    }

    const matchedData = extractAutoCardData(first);
    const autoRecord = {
      ...ocrHints,
      ...matchedData,
      // A number/HP read directly off the card is stronger evidence than the
      // matched database record's own fields, which are only as good as the
      // match itself — especially important when confidence isn't high and
      // the match could be the wrong printing of a same-named card.
      number: cleanText(ocrHints.number) || matchedData.number,
      hp: cleanText(ocrHints.hp) || matchedData.hp,
    };

    return {
      found: true,
      name: autoRecord.name || first.name || titleCase(probableName),
      set: autoRecord.set || first.set?.name || "Unknown Set",
      number: autoRecord.number || first.localId || "",
      rarity: autoRecord.rarity || first.rarity || "",
      values: extractCardValues(first),
      confidence: resolveLookupConfidence(first, ocrHints, leadScore, scoreGap),
      autoRecord,
      apiError,
      candidates: buildCandidateSummaries(scored),
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
      apiError: true,
      candidates: [],
    };
  }
}

// Cheap pre-rank on brief {id, localId, name} objects before spending a full
// detail fetch on each: an exact collector-number match is the strongest
// signal, exact/substring name match next, otherwise preserve query order
// (earlier queries were more targeted).
function coarseRankBriefCandidates(briefs, probableName, collectorNumber) {
  const wantedName = String(probableName || "").toLowerCase();
  return briefs
    .map((brief, index) => {
      let score = -index;
      const briefNumber = normalizeCollectorNumber(brief.localId);
      if (collectorNumber && briefNumber && briefNumber === collectorNumber) score += 1000;
      const briefName = String(brief.name || "").toLowerCase();
      if (wantedName && briefName === wantedName) score += 200;
      else if (wantedName && briefName.includes(wantedName)) score += 100;
      return { brief, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.brief);
}

// Top-ranked alternates for the "other possible matches" picker — kept small
// and display-only (id/name/set/number/image/score) rather than the full API
// record, since the user only needs enough to tell printings apart.
function buildCandidateSummaries(scored) {
  return scored.slice(0, 5).map(({ card, score }) => ({
    id: cleanText(card?.id),
    name: cleanText(card?.name),
    set: cleanText(card?.set?.name),
    number: cleanText(card?.localId),
    image: cleanText(card?.image) ? `${cleanText(card.image)}/low.png` : "",
    score,
  })).filter((entry) => entry.id);
}

function buildAnalysisResult(quality, cardInfo, ocrText) {
  const autoRecord = cardInfo.autoRecord || extractOcrCardHints(ocrText);
  const note = cardInfo.found
    ? "Card match found from OCR text and public card archives. Review if confidence is not high."
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
    candidates: Array.isArray(cardInfo.candidates) ? cardInfo.candidates : [],
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

  renderCandidateList(analysis);

  // Pricing display is paused for now while we focus on identification
  // accuracy — the raw/PSA9/PSA10 values are still fetched and stored
  // (see analysis.values), just not shown here.
  els.analysisValues.innerHTML = "";

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
      ["Set Archive", analysis.autoRecord?.archives?.setArchiveUrl],
      ["TCGplayer", analysis.autoRecord?.tcg?.tcgplayerUrl],
      ["Cardmarket", analysis.autoRecord?.tcg?.cardmarketUrl],
      ["Scan Confidence", analysis.confidence],
      ["Auto Fields", String(analysis.autoFieldCount || 0)],
      ["Text We Read", analysis.ocrExcerpt],
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

function renderCandidateList(analysis) {
  if (!els.candidateList) return;
  const candidates = Array.isArray(analysis.candidates) ? analysis.candidates : [];
  const showList = candidates.length > 1 && analysis.confidence !== "high";
  els.candidateList.classList.toggle("hidden", !showList);
  els.candidateCards.innerHTML = "";
  if (!showList) return;

  candidates.forEach((candidate) => {
    const node = els.candidateCardTemplate.content.firstElementChild.cloneNode(true);
    const thumb = node.querySelector(".candidate-thumb");
    const name = node.querySelector(".candidate-name");
    const meta = node.querySelector(".candidate-meta");
    thumb.src = candidate.image || "";
    thumb.alt = `${candidate.name || "Card"} thumbnail`;
    name.textContent = candidate.name || "Unknown Card";
    meta.textContent = [candidate.set, candidate.number && `#${candidate.number}`].filter(Boolean).join(" · ") || "Unknown printing";
    node.addEventListener("click", () => selectCandidateCard(candidate.id));
    els.candidateCards.appendChild(node);
  });
}

// Swaps the active result to a specific candidate the user picked instead of
// the automatically top-scored one. Reuses the OCR-derived condition/OCR
// excerpt already on hand rather than re-running OCR.
async function selectCandidateCard(cardId) {
  if (!cardId || !state.analysis) return;
  status("Loading selected card...");
  try {
    const card = await tcgdexGetCard(cardId);
    if (!card) {
      status("Could not load that card. Try again.");
      return;
    }

    const previousAuto = state.analysis.autoRecord || {};
    const matchedData = extractAutoCardData(card);
    const autoRecord = {
      ...previousAuto,
      ...matchedData,
      number: cleanText(previousAuto.number) || matchedData.number,
      hp: cleanText(previousAuto.hp) || matchedData.hp,
    };

    const cardInfo = {
      found: true,
      name: autoRecord.name || card.name || "Unknown Card",
      set: autoRecord.set || card.set?.name || "Unknown Set",
      number: autoRecord.number || card.localId || "",
      rarity: autoRecord.rarity || card.rarity || "",
      values: extractCardValues(card),
      confidence: "high",
      autoRecord,
      candidates: state.analysis.candidates || [],
    };

    const analysis = buildAnalysisResult(state.analysis.condition, cardInfo, state.analysis.ocrExcerpt || "");
    analysis.candidates = state.analysis.candidates || [];
    state.analysis = analysis;
    renderResult(analysis);
    status(`Switched to ${analysis.name}. Review and save when ready.`);
  } catch {
    status("Could not load that card. Try again.");
  }
}

function saveAnalyzedCard() {
  if (!state.analysis) {
    status("No analysis available to save.");
    return;
  }

  // Manual search can produce a result with no locally scanned photo — fall
  // back to the matched card's official image so it can still be saved.
  const auto = state.analysis.autoRecord || {};
  const cardImage = runtime.imageDataUrl || cleanText(auto.images?.large) || cleanText(auto.images?.small);
  if (!cardImage) {
    status("Add a photo, or pick a manual-search match with an official image, before saving.");
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
    image: cardImage,
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
  runtime.scanState = "idle";

  els.previewImage.src = "";
  els.previewWrap.classList.add("hidden");
  els.scanStart.classList.remove("hidden");
  els.resultPanel.classList.add("hidden");
  status("Ready for next card.");
}


async function optimizeCameraTrack(track) {
  if (!track?.getCapabilities || !track?.applyConstraints) return;
  try {
    const capabilities = track.getCapabilities();
    const advanced = [];
    if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("continuous")) {
      advanced.push({ focusMode: "continuous" });
    }
    if (Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes("continuous")) {
      advanced.push({ exposureMode: "continuous" });
    }
    if (Array.isArray(capabilities.whiteBalanceMode) && capabilities.whiteBalanceMode.includes("continuous")) {
      advanced.push({ whiteBalanceMode: "continuous" });
    }
    if (capabilities.zoom?.max && capabilities.zoom.max >= 2) {
      advanced.push({ zoom: Math.min(2, capabilities.zoom.max) });
    }
    if (advanced.length) {
      await track.applyConstraints({ advanced });
    }
  } catch {
    // Best-effort only; unsupported camera controls should not block scanning.
  }
}

async function dataUrlToBitmap(dataUrl) {
  return createImageBitmap(await (await fetch(dataUrl)).blob());
}

async function prepareScanForAnalysis(dataUrl) {
  const bitmap = await dataUrlToBitmap(dataUrl);
  const sourceCanvas = document.createElement("canvas");
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  sourceCanvas.width = Math.max(1, Math.round(bitmap.width * scale));
  sourceCanvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, sourceCanvas.width, sourceCanvas.height);

  const bounds = detectCardBounds(sourceCanvas);
  if (!bounds) {
    return {
      dataUrl,
      imageBitmap: bitmap,
      cropDetected: false,
      hints: {},
    };
  }

  const normalized = normalizeCardCrop(sourceCanvas, bounds);
  return {
    dataUrl: normalized,
    imageBitmap: await dataUrlToBitmap(normalized),
    cropDetected: true,
    hints: {},
  };
}

function detectCardBounds(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  if (!width || !height) return null;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const grayscale = new Float32Array(width * height);
  for (let i = 0, p = 0; i < imageData.length; i += 4, p += 1) {
    grayscale[p] = (0.299 * imageData[i]) + (0.587 * imageData[i + 1]) + (0.114 * imageData[i + 2]);
  }

  const colScores = new Array(width).fill(0);
  const rowScores = new Array(height).fill(0);

  for (let x = 1; x < width; x += 1) {
    let total = 0;
    let count = 0;
    for (let y = 1; y < height; y += 4) {
      const here = grayscale[(y * width) + x];
      const prev = grayscale[(y * width) + x - 1];
      total += Math.abs(here - prev);
      count += 1;
    }
    colScores[x] = count ? total / count : 0;
  }

  for (let y = 1; y < height; y += 1) {
    let total = 0;
    let count = 0;
    for (let x = 1; x < width; x += 4) {
      const here = grayscale[(y * width) + x];
      const prev = grayscale[((y - 1) * width) + x];
      total += Math.abs(here - prev);
      count += 1;
    }
    rowScores[y] = count ? total / count : 0;
  }

  const smoothCols = smoothSeries(colScores, 9);
  const smoothRows = smoothSeries(rowScores, 9);
  const left = findPeakIndex(smoothCols, Math.floor(width * 0.06), Math.floor(width * 0.42));
  const right = findPeakIndex(smoothCols, Math.floor(width * 0.58), Math.floor(width * 0.94));
  const top = findPeakIndex(smoothRows, Math.floor(height * 0.06), Math.floor(height * 0.38));
  const bottom = findPeakIndex(smoothRows, Math.floor(height * 0.62), Math.floor(height * 0.94));

  if ([left, right, top, bottom].some((value) => value == null)) return null;
  const cropWidth = right - left;
  const cropHeight = bottom - top;
  if (cropWidth < width * 0.28 || cropHeight < height * 0.35) return null;

  const ratio = cropWidth / cropHeight;
  if (ratio < 0.58 || ratio > 0.82) return null;

  const threshold = average(smoothCols.concat(smoothRows)) * 0.9;
  if (smoothCols[left] < threshold || smoothCols[right] < threshold || smoothRows[top] < threshold || smoothRows[bottom] < threshold) {
    return null;
  }

  const padX = Math.round(cropWidth * 0.03);
  const padY = Math.round(cropHeight * 0.03);
  return {
    x: clamp(left - padX, 0, width - 1),
    y: clamp(top - padY, 0, height - 1),
    width: clamp(cropWidth + (padX * 2), 1, width),
    height: clamp(cropHeight + (padY * 2), 1, height),
  };
}

function normalizeCardCrop(sourceCanvas, bounds) {
  const targetWidth = 900;
  const targetHeight = 1260;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(sourceCanvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - 8) * 1.08 + 8, 0, 255);
    data[i + 1] = clamp((data[i + 1] - 8) * 1.08 + 8, 0, 255);
    data[i + 2] = clamp((data[i + 2] - 8) * 1.08 + 8, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function smoothSeries(values, radius) {
  return values.map((_, index) => {
    let total = 0;
    let count = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      const value = values[index + offset];
      if (value == null) continue;
      total += value;
      count += 1;
    }
    return count ? total / count : 0;
  });
}

function findPeakIndex(values, start, end) {
  let peakIndex = null;
  let peakValue = -Infinity;
  for (let index = Math.max(0, start); index <= Math.min(values.length - 1, end); index += 1) {
    if (values[index] > peakValue) {
      peakValue = values[index];
      peakIndex = index;
    }
  }
  return peakIndex;
}

function average(values) {
  if (!Array.isArray(values) || !values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Could not read video file"));
    };
    const cleanup = () => {
      video.removeEventListener(eventName, onDone);
      video.removeEventListener("error", onError);
    };
    video.addEventListener(eventName, onDone, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

async function captureVideoFrame(video, time) {
  const safeTime = Math.max(0, Number(time) || 0);
  if (Math.abs(video.currentTime - safeTime) > 0.02) {
    video.currentTime = safeTime;
    await waitForVideoEvent(video, "seeked");
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
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

function scoreCardMatch(card, ocrText, hints = {}) {
  const text = String(ocrText || "").toLowerCase();
  const name = String(card?.name || "").toLowerCase();
  const set = String(card?.set?.name || "").toLowerCase();
  const cardNumber = normalizeCollectorNumber(card?.localId);
  const hintedNumber = normalizeCollectorNumber(hints?.number);
  const cardHp = cleanText(card?.hp);
  const hintedHp = cleanText(hints?.hp);

  let score = 0;
  if (name && text.includes(name)) score += 90;

  if (hintedNumber && cardNumber) {
    // An exact number match is one of the strongest disambiguators between
    // same-named cards across sets/reprints; a confident mismatch should
    // actively demote the candidate rather than being ignored.
    score += hintedNumber === cardNumber ? 70 : -40;
  } else if (cardNumber.length >= 2 && text.includes(cardNumber.toLowerCase())) {
    // Fallback for when OCR didn't cleanly parse a number hint: only credit
    // this from the raw text for numbers long enough to not match by chance
    // (a single digit like "4" would match almost any OCR text).
    score += 20;
  }

  if (hintedHp && cardHp) {
    score += hintedHp === cardHp ? 25 : -15;
  }

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

// Cropped tightly to the bottom edge where the collector number/rarity print
// sits, so this pass reads far more reliably than fishing for a short number
// anywhere in the full card text (which is full of other numbers: HP, attack
// damage, weakness, retreat cost, the Pokedex "LV. NN #N" reference line).
function makeBottomStripDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cropH = Math.max(60, Math.round(img.height * 0.12));
      const cropY = Math.max(0, img.height - cropH);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = cropH * 2;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, cropY, img.width, cropH, 0, 0, canvas.width, canvas.height);

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

