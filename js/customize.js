function renderBinderManager() {
  els.binderManager.innerHTML = "";

  state.binders.forEach((binder) => {
    const wrap = document.createElement("section");
    wrap.className = "binder-config";

    const [c1, c2] = BINDER_STYLES[binder.style] || BINDER_STYLES.ocean;
    const coverTitle = binder.coverTitle || binder.name;
    const coverSubtitle = cleanText(binder.coverSubtitle);
    const coverTitleScale = clamp(Number(binder.coverTitleScale) || 100, 70, 150);
    const coverA = binder.coverColorA || c1;
    const coverB = binder.coverColorB || c2;
    const sleeve = binder.sleeveColor || "#9cdfff";
    const pageTint = binder.pageTint || "#0f1d2f";
    const coverScale = clamp(Number(binder.coverImageScale) || 100, 70, 220);
    const coverFocusX = clamp(Number(binder.coverImageFocusX) || 50, 0, 100);
    const coverFocusY = clamp(Number(binder.coverImageFocusY) || 50, 0, 100);
    const cardArtLocked = !!binder.lockCardArtFrame;
    const cardImageFit = cleanText(binder.cardImageFit) || "cover";
    const cardImageZoom = clamp(Number(binder.cardImageZoom) || 100, 80, 180);
    const cardImageFocusX = clamp(Number(binder.cardImageFocusX) || 50, 0, 100);
    const cardImageFocusY = clamp(Number(binder.cardImageFocusY) || 50, 0, 100);
    const maxPages = Math.max(1, Number(binder.pages) || 1);
    const customPage = clamp(Number(runtime.viewPageByBinder[binder.id] || 1), 1, maxPages);
    const customTheme = getPageTheme(binder, customPage);
    const pageImageFit = cleanText(customTheme.backgroundImageFit) || "cover";
    const pageImageZoom = clamp(Number(customTheme.backgroundImageZoom) || 100, 60, 260);
    const pageImageFocusX = clamp(Number(customTheme.backgroundImageFocusX) || 50, 0, 100);
    const pageImageFocusY = clamp(Number(customTheme.backgroundImageFocusY) || 50, 0, 100);
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
          Panel art (photo or video)
          <input type="file" accept="image/*,video/*" data-action="panel-image" data-panel-id="${panel.id}" />
        </label>
        ${panel.video ? '<div class="michi-lab-note muted">🎬 Video panel — plays in your binder.</div>' : ""}
        <button class="btn ghost small" type="button" data-action="panel-image-clear" data-panel-id="${panel.id}">Clear Panel Art</button>
        <label>
          Art fit
          <select data-action="panel-fit" data-panel-id="${panel.id}">
            <option value="cover" ${(cleanText(panel.fit) || "cover") === "cover" ? "selected" : ""}>Cover</option>
            <option value="contain" ${cleanText(panel.fit) === "contain" ? "selected" : ""}>Contain</option>
            <option value="stretch" ${cleanText(panel.fit) === "stretch" ? "selected" : ""}>Stretch</option>
          </select>
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

      <details class="michi-section">
        <summary>Cover Design</summary>
        <div class="sub-grid">
          <label>
            Cover title
            <input type="text" value="${escapeAttr(coverTitle)}" data-action="cover-title" />
          </label>
          <label>
            Cover subtitle
            <input type="text" value="${escapeAttr(coverSubtitle)}" data-action="cover-subtitle" placeholder="e.g. Fire & Electric Set" />
          </label>
          <label>
            Cover image
            <input type="file" accept="image/*" data-action="cover-image" />
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
          <label>
            Cover title size (${coverTitleScale}%)
            <input type="range" min="70" max="150" step="1" value="${coverTitleScale}" data-action="cover-title-size" />
          </label>
          <button class="btn ghost small" data-action="clear-cover" type="button">Clear Cover Image</button>
        </div>
        <div class="cover-preview" style="background-image:${binder.coverImage ? `linear-gradient(rgba(3,12,22,.28), rgba(3,12,22,.55)), url(${binder.coverImage})` : `linear-gradient(120deg, ${coverA}, ${coverB})`}; background-size:${binder.coverImage ? `${coverScale}%, ${coverScale}%` : "cover"}; background-position:${binder.coverImage ? `${coverFocusX}% ${coverFocusY}%, ${coverFocusX}% ${coverFocusY}%` : "center"}; --cover-title-scale:${coverTitleScale / 100};"><strong class="cover-preview-title">${escapeHtml(coverTitle)}</strong>${coverSubtitle ? `<span class="cover-preview-subtitle">${escapeHtml(coverSubtitle)}</span>` : ""}</div>
      </details>

      <details class="michi-section">
        <summary>Binder &amp; Card Style</summary>
        <div class="sub-grid">
          <label>
            Sleeve border
            <input type="color" value="${escapeAttr(hexSafe(sleeve, "#9cdfff"))}" data-action="sleeve" />
          </label>
          <label>
            Page tint color
            <input type="color" value="${escapeAttr(hexSafe(pageTint, "#0f1d2f"))}" data-action="page-tint" />
          </label>
          <label>
            Card size (${clamp(Number(binder.cardScale) || 86, 65, 120)}%)
            <input type="range" min="65" max="120" step="1" value="${clamp(Number(binder.cardScale) || 86, 65, 120)}" data-action="card-scale" />
          </label>
          <label>
            Card gap (${clamp(Number(binder.cardGap) || 8, 4, 18)}px)
            <input type="range" min="4" max="18" step="1" value="${clamp(Number(binder.cardGap) || 8, 4, 18)}" data-action="card-gap" />
          </label>
          <label>
            Card art fit
            <select data-action="card-image-fit" ${cardArtLocked ? "disabled" : ""}>
              <option value="cover" ${cardImageFit === "cover" ? "selected" : ""}>Cover</option>
              <option value="contain" ${cardImageFit === "contain" ? "selected" : ""}>Contain</option>
              <option value="stretch" ${cardImageFit === "stretch" ? "selected" : ""}>Stretch</option>
            </select>
          </label>
          <label>
            Card art zoom (${cardImageZoom}%)
            <input type="range" min="80" max="180" step="1" value="${cardImageZoom}" data-action="card-image-zoom" ${cardArtLocked ? "disabled" : ""} />
          </label>
          <label>
            Card art focus X (${cardImageFocusX}%)
            <input type="range" min="0" max="100" step="1" value="${cardImageFocusX}" data-action="card-image-focus-x" ${cardArtLocked ? "disabled" : ""} />
          </label>
          <label>
            Card art focus Y (${cardImageFocusY}%)
            <input type="range" min="0" max="100" step="1" value="${cardImageFocusY}" data-action="card-image-focus-y" ${cardArtLocked ? "disabled" : ""} />
          </label>
          <label class="toggle-inline">
            Lock card art framing
            <input type="checkbox" data-action="lock-card-frame" ${cardArtLocked ? "checked" : ""} />
          </label>
        </div>
        <div class="sleeve-preview" style="border-color:${sleeve}; background-color:${pageTint};"></div>
      </details>

      <div class="michi-page-lab">
        <h5>Michi Method Page Lab</h5>
        <label class="target-page-select">
          Editing page
          <select data-action="theme-page">${pageOptions}</select>
        </label>
        <p class="michi-lab-note muted">Scene panels, stickers, and theme below apply to this page only, unless you use "Apply This Style To All Pages".</p>

        <div class="michi-workbench">
          <div class="michi-workbench-preview">
            <div class="page-style-preview" style="${buildPagePreviewStyle(customTheme)}">
              <span>${escapeHtml(customTheme.designTitle || `${getPageMethodLabel(customTheme.method)} Page ${customPage}`)}</span>
            </div>
            <div class="michi-lab-note muted">Live preview: drag and resize panels here. This stays visible while you edit.</div>
            <div class="panel-layout-editor" data-binder-id="${binder.id}" data-page="${customPage}"></div>
          </div>

          <div class="michi-workbench-controls">
            <details class="michi-section" open>
              <summary>Scene Panels</summary>
              <label>
                Add panels from photos or videos
                <input type="file" accept="image/*,video/*" multiple data-action="panel-bulk-add" />
              </label>
              <div class="michi-lab-note muted">Pick multiple files at once to create one panel per file. Video panels play right in your binder.</div>
              <div class="panel-template-actions">${panelButtons}</div>
              <div class="panel-config-list">${panelCards || '<p class="muted">No scene panels yet. Add one above or drag it on the preview grid.</p>'}</div>
            </details>

            <details class="michi-section" open>
              <summary>Stickers</summary>
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
            </details>

            <details class="michi-section">
              <summary>Page Theme &amp; Art</summary>
              <div class="sub-grid">
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
                  Page art fit
                  <select data-action="theme-image-fit">
                    <option value="cover" ${pageImageFit === "cover" ? "selected" : ""}>Cover</option>
                    <option value="contain" ${pageImageFit === "contain" ? "selected" : ""}>Contain</option>
                    <option value="stretch" ${pageImageFit === "stretch" ? "selected" : ""}>Stretch</option>
                  </select>
                </label>
                <label>
                  Page art zoom (${pageImageZoom}%)
                  <input type="range" min="60" max="260" step="1" value="${pageImageZoom}" data-action="theme-image-zoom" />
                </label>
                <label>
                  Page art focus X (${pageImageFocusX}%)
                  <input type="range" min="0" max="100" step="1" value="${pageImageFocusX}" data-action="theme-image-focus-x" />
                </label>
                <label>
                  Page art focus Y (${pageImageFocusY}%)
                  <input type="range" min="0" max="100" step="1" value="${pageImageFocusY}" data-action="theme-image-focus-y" />
                </label>
                <label>
                  Design title
                  <input type="text" value="${escapeAttr(customTheme.designTitle || "")}" data-action="theme-title" placeholder="e.g. Neon Sakura" />
                </label>
              </div>
            </details>

            <details class="michi-section">
              <summary>Quick Actions</summary>
              <div class="page-style-actions">
                <button class="btn ghost small" data-action="theme-clear-stickers" type="button">Clear Stickers</button>
                <button class="btn ghost small" data-action="theme-clear-image" type="button">Clear Page Art</button>
                <button class="btn ghost small" data-action="theme-apply-all" type="button">Apply This Style To All Pages</button>
              </div>
            </details>
          </div>
        </div>
      </div>
    `;

    const renameInput = wrap.querySelector('input[data-action="rename"]');
    const styleSelect = wrap.querySelector('select[data-action="style"]');
    const deleteBtn = wrap.querySelector('button[data-action="delete"]');
    const coverTitleInput = wrap.querySelector('input[data-action="cover-title"]');
    const coverSubtitleInput = wrap.querySelector('input[data-action="cover-subtitle"]');
    const coverImageInput = wrap.querySelector('input[data-action="cover-image"]');
    const pageTintInput = wrap.querySelector('input[data-action="page-tint"]');
    const coverAInput = wrap.querySelector('input[data-action="cover-a"]');
    const coverBInput = wrap.querySelector('input[data-action="cover-b"]');
    const sleeveInput = wrap.querySelector('input[data-action="sleeve"]');
    const coverScaleInput = wrap.querySelector('input[data-action="cover-scale"]');
    const coverFocusXInput = wrap.querySelector('input[data-action="cover-focus-x"]');
    const coverFocusYInput = wrap.querySelector('input[data-action="cover-focus-y"]');
    const coverTitleSizeInput = wrap.querySelector('input[data-action="cover-title-size"]');
    const cardScaleInput = wrap.querySelector('input[data-action="card-scale"]');
    const cardGapInput = wrap.querySelector('input[data-action="card-gap"]');
    const cardImageFitSelect = wrap.querySelector('select[data-action="card-image-fit"]');
    const cardImageZoomInput = wrap.querySelector('input[data-action="card-image-zoom"]');
    const cardImageFocusXInput = wrap.querySelector('input[data-action="card-image-focus-x"]');
    const cardImageFocusYInput = wrap.querySelector('input[data-action="card-image-focus-y"]');
    const lockCardFrameInput = wrap.querySelector('input[data-action="lock-card-frame"]');
    const clearCoverBtn = wrap.querySelector('button[data-action="clear-cover"]');
    const themePageSelect = wrap.querySelector('select[data-action="theme-page"]');
    const themeMethodSelect = wrap.querySelector('select[data-action="theme-method"]');
    const themePatternSelect = wrap.querySelector('select[data-action="theme-pattern"]');
    const themeTintInput = wrap.querySelector('input[data-action="theme-tint"]');
    const themeSleeveInput = wrap.querySelector('input[data-action="theme-sleeve"]');
    const themeStrengthInput = wrap.querySelector('input[data-action="theme-strength"]');
    const themeImageInput = wrap.querySelector('input[data-action="theme-image"]');
    const themeImageFitSelect = wrap.querySelector('select[data-action="theme-image-fit"]');
    const themeImageZoomInput = wrap.querySelector('input[data-action="theme-image-zoom"]');
    const themeImageFocusXInput = wrap.querySelector('input[data-action="theme-image-focus-x"]');
    const themeImageFocusYInput = wrap.querySelector('input[data-action="theme-image-focus-y"]');
    const themeTitleInput = wrap.querySelector('input[data-action="theme-title"]');
    const panelBulkAddInput = wrap.querySelector('input[data-action="panel-bulk-add"]');
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
    const panelFitSelects = wrap.querySelectorAll('select[data-action="panel-fit"]');
    const panelWidthSelects = wrap.querySelectorAll('select[data-action="panel-width"]');
    const panelHeightSelects = wrap.querySelectorAll('select[data-action="panel-height"]');
    const panelImageInputs = wrap.querySelectorAll('input[data-action="panel-image"]');
    const panelImageClearButtons = wrap.querySelectorAll('button[data-action="panel-image-clear"]');
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

    coverSubtitleInput.addEventListener("change", () => {
      binder.coverSubtitle = cleanText(coverSubtitleInput.value);
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

    coverTitleSizeInput.addEventListener("change", () => {
      binder.coverTitleScale = clamp(Number(coverTitleSizeInput.value) || 100, 70, 150);
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardScaleInput.addEventListener("input", () => {
      binder.cardScale = clamp(Number(cardScaleInput.value) || 86, 65, 120);
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardGapInput.addEventListener("input", () => {
      binder.cardGap = clamp(Number(cardGapInput.value) || 8, 4, 18);
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardImageFitSelect.addEventListener("change", () => {
      if (binder.lockCardArtFrame) return;
      binder.cardImageFit = cardImageFitSelect.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardImageZoomInput.addEventListener("input", () => {
      if (binder.lockCardArtFrame) return;
      binder.cardImageZoom = clamp(Number(cardImageZoomInput.value) || 100, 80, 180);
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardImageFocusXInput.addEventListener("input", () => {
      if (binder.lockCardArtFrame) return;
      binder.cardImageFocusX = clamp(Number(cardImageFocusXInput.value) || 50, 0, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardImageFocusYInput.addEventListener("input", () => {
      if (binder.lockCardArtFrame) return;
      binder.cardImageFocusY = clamp(Number(cardImageFocusYInput.value) || 50, 0, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    lockCardFrameInput.addEventListener("change", () => {
      binder.lockCardArtFrame = !!lockCardFrameInput.checked;
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

    themeImageFitSelect.addEventListener("change", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.backgroundImageFit = themeImageFitSelect.value;
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeImageZoomInput.addEventListener("input", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.backgroundImageZoom = clamp(Number(themeImageZoomInput.value) || 100, 60, 260);
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeImageFocusXInput.addEventListener("input", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.backgroundImageFocusX = clamp(Number(themeImageFocusXInput.value) || 50, 0, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    themeImageFocusYInput.addEventListener("input", () => {
      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);
      theme.backgroundImageFocusY = clamp(Number(themeImageFocusYInput.value) || 50, 0, 100);
      persist();
      renderCollection();
      renderBinderManager();
    });

    panelBulkAddInput.addEventListener("change", async () => {
      const files = Array.from(panelBulkAddInput.files || []);
      if (!files.length) return;

      const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
      const theme = upsertPageTheme(binder, page);

      let added = 0;
      const failures = [];

      for (const file of files) {
        if (getReservedSlotsForTheme(theme).size >= 9) {
          failures.push(`"${file.name}" skipped (page is full).`);
          continue;
        }
        try {
          const media = await readPanelMediaFile(file);
          const panel = createScenePanelFromTemplate(SCENE_PANEL_TEMPLATES.square, theme);
          panel.image = media.image;
          panel.video = media.video;
          theme.scenePanels = [...theme.scenePanels, panel];
          added += 1;
        } catch (error) {
          failures.push(error.message || `"${file.name}" could not be added.`);
        }
      }

      rebalancePageForLayout(binder.id, page);
      persist();
      renderCollection();
      renderBinderManager();

      const parts = [];
      if (added) parts.push(`Added ${added} scene panel${added === 1 ? "" : "s"} to ${binder.name} page ${page}.`);
      if (failures.length) parts.push(failures.join(" "));
      status(parts.join(" ") || "No panels added.");
      panelBulkAddInput.value = "";
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
        theme.scenePanels = resizePanelWithAutoAnchor(theme, select.dataset.panelId, template.colSpan, template.rowSpan);
        rebalancePageForLayout(binder.id, page);
        persist();
        renderCollection();
        renderBinderManager();
      });
    });

    panelFitSelects.forEach((select) => {
      select.addEventListener("change", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, select.dataset.panelId, (panel) => ({
          ...panel,
          fit: ["cover", "contain", "stretch"].includes(select.value) ? select.value : "cover",
        }));
      });
    });

    panelWidthSelects.forEach((select) => {
      select.addEventListener("change", () => {
        const page = clamp(Number(themePageSelect.value) || 1, 1, maxPages);
        const theme = upsertPageTheme(binder, page);
        const nextWidth = clamp(Number(select.value) || 1, 1, 3);
        const current = theme.scenePanels.find((panel) => panel.id === select.dataset.panelId);
        if (!current) return;
        theme.scenePanels = resizePanelWithAutoAnchor(theme, select.dataset.panelId, nextWidth, Number(current.rowSpan || 1));
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
        const current = theme.scenePanels.find((panel) => panel.id === select.dataset.panelId);
        if (!current) return;
        theme.scenePanels = resizePanelWithAutoAnchor(theme, select.dataset.panelId, Number(current.colSpan || 1), nextHeight);
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
        try {
          const media = await readPanelMediaFile(file);
          theme.scenePanels = theme.scenePanels.map((panel) => panel.id === input.dataset.panelId
            ? { ...panel, image: media.image, video: media.video }
            : panel);
          persist();
          renderCollection();
          renderBinderManager();
        } catch (error) {
          status(error.message || "Could not add that file.");
        }
      });
    });

    panelImageClearButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mutateScenePanel(binder, maxPages, themePageSelect, button.dataset.panelId, (panel) => ({
          ...panel,
          image: "",
          video: "",
        }));
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
          backgroundImageFit: source.backgroundImageFit,
          backgroundImageZoom: source.backgroundImageZoom,
          backgroundImageFocusX: source.backgroundImageFocusX,
          backgroundImageFocusY: source.backgroundImageFocusY,
          cardScale: source.cardScale,
          cardGap: source.cardGap,
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

      archiveDeletedBinder(binder, cardsInBinder);

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


const MAX_PANEL_VIDEO_BYTES = 12 * 1024 * 1024;

// Reads an image or video file for scene/page art. Videos are kept as-is (no
// re-encode) but capped in size since everything persists to localStorage;
// a poster frame is always captured so non-video render paths (editor grid,
// thumbnails) have something to show without needing to decode video.
async function readPanelMediaFile(file) {
  const isVideo = String(file.type || "").startsWith("video/");
  if (!isVideo) {
    return { image: await resizeImageFile(file, 1600, 0.84), video: "" };
  }
  if (file.size > MAX_PANEL_VIDEO_BYTES) {
    const limitMb = Math.round(MAX_PANEL_VIDEO_BYTES / 1024 / 1024);
    throw new Error(`"${file.name}" is too large for a video panel (limit ${limitMb}MB).`);
  }
  const videoUrl = await fileToDataUrl(file);
  const poster = await capturePosterFrame(videoUrl);
  return { image: poster, video: videoUrl };
}

async function capturePosterFrame(videoDataUrl) {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = videoDataUrl;
  await waitForVideoEvent(video, "loadedmetadata");
  const posterTime = Math.min(0.15, (Number(video.duration) || 1) * 0.1);
  return captureVideoFrame(video, posterTime);
}

