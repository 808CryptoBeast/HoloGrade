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
  renderRecoveryPanel();

  const binders = state.binders
    .map((binder) => ({
      binder,
      cards: filtered.filter((c) => c.binderId === binder.id),
      allCards: state.cards.filter((c) => c.binderId === binder.id),
    }))
    .filter(({ binder, cards }) => {
      if (binderFilter !== "all" && binderFilter !== binder.id) return false;
      if (filterText) return cards.length > 0;
      return true;
    });

  els.binderShelf.innerHTML = "";

  if (!binders.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = state.binders.length ? "No cards match your current filters." : "No binders yet.";
    els.binderShelf.appendChild(empty);
    return;
  }

  let emptySlotHintShown = false;

  binders.forEach(({ binder, cards, allCards }) => {
    const block = document.createElement("section");
    const isOpen = !!runtime.openBinders[binder.id];
    block.className = `binder-block ${isOpen ? "open" : "closed"}`;

    const [c1, c2] = BINDER_STYLES[binder.style] || BINDER_STYLES.ocean;
    const totalPages = Math.max(1, Number(binder.pages) || 1);
    const currentPage = clamp(getViewedPage(binder.id, totalPages), 1, totalPages);
    runtime.viewPageByBinder[binder.id] = currentPage;

    const coverTitle = cleanText(binder.coverTitle) || binder.name;
    const coverSubtitle = cleanText(binder.coverSubtitle);
    const coverTitleScale = clamp(Number(binder.coverTitleScale) || 100, 70, 150);
    const coverA = binder.coverColorA || c1;
    const coverB = binder.coverColorB || c2;
    const coverSize = `${clamp(Number(binder.coverImageScale) || 100, 70, 220)}%`;
    const coverPosition = `${clamp(Number(binder.coverImageFocusX) || 50, 0, 100)}% ${clamp(Number(binder.coverImageFocusY) || 50, 0, 100)}%`;
    const pageTheme = getPageTheme(binder, currentPage);
    const pageCardSizing = getPageCardSizing(binder, pageTheme);
    const pageCardPreset = getCardSizePresetKey(pageCardSizing.scale, pageCardSizing.gap);
    const compactList = !!binder.compactList;
    const clickMoveEnabled = !!binder.clickMoveEnabled;
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
      <button class="binder-cover-card" data-action="toggle-binder" type="button" style="background-image:${coverBg}; background-size:${binder.coverImage ? `${coverSize}, ${coverSize}` : "cover"}; background-position:${binder.coverImage ? `${coverPosition}, ${coverPosition}` : "center"}; --cover-title-scale:${coverTitleScale / 100};">
        <span class="binder-spine"></span>
        <span class="binder-cover-copy">
          <span class="binder-cover-title">${escapeHtml(coverTitle)}</span>
          ${coverSubtitle ? `<span class="binder-cover-subtitle">${escapeHtml(coverSubtitle)}</span>` : ""}
          <span class="binder-cover-meta">${cards.length} cards · ${totalPages} page${totalPages === 1 ? "" : "s"}</span>
        </span>
      </button>

      <div class="binder-interior">
      <header class="binder-header" style="background-image:${coverBg}; background-size:${binder.coverImage ? `${coverSize}, ${coverSize}` : "cover"}; background-position:${binder.coverImage ? `${coverPosition}, ${coverPosition}` : "center"};">
        <div>
          <h3>${escapeHtml(coverTitle)}</h3>
          ${coverSubtitle ? `<p class="meta">${escapeHtml(coverSubtitle)}</p>` : ""}
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
          <button class="btn ghost small" data-action="toggle-compact-list" type="button">${compactList ? "Compact: On" : "Compact: Off"}</button>
          <button class="btn ghost small" data-action="toggle-click-move" type="button">${clickMoveEnabled ? "Click Move: On" : "Click Move: Off"}</button>
          <button class="btn ghost small" data-action="toggle-lock-card-frame" type="button">${binder.lockCardArtFrame ? "Card Art Locked" : "Card Art Unlocked"}</button>
          <div class="card-preset-actions" aria-label="Card size presets">
            ${Object.entries(CARD_SIZE_PRESETS).map(([key, preset]) => `<button class="btn ghost small ${pageCardPreset === key ? "active" : ""}" data-action="card-preset" data-preset="${key}" type="button">${escapeHtml(preset.label)}</button>`).join("")}
          </div>
        </div>
      </header>
      <div class="binder-grid" data-binder-id="${binder.id}" data-page="${currentPage}" style="--slot-scale:${pageCardSizing.scale / 100}; --slot-gap:${pageCardSizing.gap}px;"></div>
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
    const compactToggleBtn = block.querySelector('button[data-action="toggle-compact-list"]');
    const clickMoveToggleBtn = block.querySelector('button[data-action="toggle-click-move"]');
    const lockCardFrameBtn = block.querySelector('button[data-action="toggle-lock-card-frame"]');
    const cardPresetButtons = block.querySelectorAll('button[data-action="card-preset"]');
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

    compactToggleBtn.addEventListener("click", () => {
      binder.compactList = !binder.compactList;
      persist();
      renderCollection();
      renderBinderManager();
    });

    clickMoveToggleBtn.addEventListener("click", () => {
      binder.clickMoveEnabled = !binder.clickMoveEnabled;
      runtime.slotMove = null;
      persist();
      renderCollection();
      renderBinderManager();
    });

    lockCardFrameBtn.addEventListener("click", () => {
      binder.lockCardArtFrame = !binder.lockCardArtFrame;
      persist();
      renderCollection();
      renderBinderManager();
    });

    cardPresetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyCardSizePresetToPage(binder, currentPage, button.dataset.preset);
        persist();
        renderCollection();
        renderBinderManager();
      });
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
        applyCardArtFrame(img, binder);
        slot.appendChild(img);
        slot.classList.add("has-card");
        slot.addEventListener("click", () => {
          if (sortBy === "binder" && clickMoveEnabled) {
            handleClickMoveSelection(binder, currentPage, slotNumber, slotCard);
            return;
          }
          openCardDetailModal(slotCard, {
            binderName: binder.coverTitle || binder.name,
            page: currentPage,
            slot: slotNumber,
          });
        });
      } else {
        slot.classList.add("empty");
        if (!state.cards.length && !emptySlotHintShown) {
          slot.textContent = "Scan a card or drag one here";
          slot.classList.add("empty-hint");
          emptySlotHintShown = true;
        } else {
          slot.textContent = "Empty";
        }
        if (sortBy === "binder" && clickMoveEnabled) {
          slot.addEventListener("click", () => {
            handleClickMoveSelection(binder, currentPage, slotNumber, null);
          });
        }
      }
      if (runtime.slotMove
        && runtime.slotMove.binderId === binder.id
        && runtime.slotMove.page === currentPage
        && runtime.slotMove.cardId === slotCard?.id) {
        slot.classList.add("move-source");
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
    list.classList.toggle("compact-list", compactList);
    const rowHeight = compactList ? 86 : 118;
    const visibleRows = clamp(sortedCardsOnPage.length || 1, 1, compactList ? 8 : 6);
    list.style.maxHeight = `${visibleRows * rowHeight}px`;
    list.style.overflowY = "auto";

    sortedCardsOnPage.forEach((card) => {
      list.appendChild(renderCardItem(card, {
        binderId: binder.id,
        page: currentPage,
        totalPages,
        compactList,
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

function renderRecoveryPanel() {
  if (!els.recoveryPanel) return;
  const removedCards = Array.isArray(state.removedCards) ? state.removedCards : [];
  const removedBinders = Array.isArray(state.removedBinders) ? state.removedBinders : [];

  if (!removedCards.length && !removedBinders.length) {
    els.recoveryPanel.innerHTML = "";
    els.recoveryPanel.classList.add("hidden");
    return;
  }

  els.recoveryPanel.classList.remove("hidden");

  const cardItems = removedCards.slice(0, 20).map((entry) => `
    <article class="recovery-item">
      <div>
        <strong>${escapeHtml(entry.card?.name || "Card")}</strong>
        <p class="meta">Removed from ${escapeHtml(getBinderLabel(entry.card?.binderId))} · Page ${Number(entry.card?.page || 1)}</p>
      </div>
      <button class="btn ghost small" type="button" data-action="restore-card" data-entry-id="${entry.id}">Restore Card</button>
    </article>
  `).join("");

  const binderItems = removedBinders.slice(0, 10).map((entry) => `
    <article class="recovery-item">
      <div>
        <strong>${escapeHtml(entry.binder?.name || "Binder")}</strong>
        <p class="meta">Deleted binder snapshot · ${entry.cards.length} cards</p>
      </div>
      <button class="btn ghost small" type="button" data-action="restore-binder" data-entry-id="${entry.id}">Restore Binder + Cards</button>
    </article>
  `).join("");

  els.recoveryPanel.innerHTML = `
    <div class="row-between">
      <h3>Recently Removed</h3>
      <button class="btn ghost small" type="button" data-action="clear-recovery">Clear History</button>
    </div>
    <div class="recovery-list">
      ${binderItems}
      ${cardItems}
    </div>
  `;

  els.recoveryPanel.querySelectorAll('button[data-action="restore-card"]').forEach((button) => {
    button.addEventListener("click", () => {
      restoreRemovedCard(button.dataset.entryId);
    });
  });

  els.recoveryPanel.querySelectorAll('button[data-action="restore-binder"]').forEach((button) => {
    button.addEventListener("click", () => {
      restoreRemovedBinder(button.dataset.entryId);
    });
  });

  const clearBtn = els.recoveryPanel.querySelector('button[data-action="clear-recovery"]');
  clearBtn?.addEventListener("click", () => {
    state.removedCards = [];
    state.removedBinders = [];
    persist();
    renderCollection();
  });
}

function archiveRemovedCard(card, reason = "removed") {
  if (!card) return;
  const entry = {
    id: cryptoRandom(),
    reason,
    removedAt: Date.now(),
    card: JSON.parse(JSON.stringify(card)),
  };
  state.removedCards = [entry, ...(state.removedCards || [])].slice(0, 80);
}

function restoreRemovedCard(entryId) {
  const removed = (state.removedCards || []).find((entry) => entry.id === entryId);
  if (!removed?.card) return;
  const card = JSON.parse(JSON.stringify(removed.card));
  const binderExists = state.binders.some((binder) => binder.id === card.binderId);
  if (!binderExists) {
    const fallback = state.binders[0];
    card.binderId = fallback.id;
    card.page = findPageWithSpace(fallback.id);
    card.slotOrder = getNextSlotOrder(fallback.id, card.page);
  } else {
    card.page = clamp(Number(card.page) || 1, 1, Math.max(1, Number(state.binders.find((b) => b.id === card.binderId)?.pages || 1)));
    card.slotOrder = getNextSlotOrder(card.binderId, card.page);
  }

  if (!card.id || state.cards.some((item) => item.id === card.id)) {
    card.id = cryptoRandom();
  }

  state.cards = [card, ...state.cards];
  state.removedCards = (state.removedCards || []).filter((entry) => entry.id !== entryId);
  persist();
  refreshBinderSelects();
  renderCollection();
  renderBinderManager();
  status(`${card.name} restored.`);
}

function archiveDeletedBinder(binder, cardsInBinder) {
  if (!binder) return;
  const snapshot = {
    id: cryptoRandom(),
    removedAt: Date.now(),
    binder: JSON.parse(JSON.stringify(binder)),
    cards: cardsInBinder.map((card) => ({
      id: card.id,
      page: Number(card.page || 1),
      slotOrder: Number(card.slotOrder || 0),
    })),
  };
  state.removedBinders = [snapshot, ...(state.removedBinders || [])].slice(0, 30);
}

function restoreRemovedBinder(entryId) {
  const entry = (state.removedBinders || []).find((item) => item.id === entryId);
  if (!entry?.binder) return;

  const originalBinder = entry.binder;
  let restoredId = originalBinder.id;
  if (state.binders.some((binder) => binder.id === restoredId)) {
    restoredId = cryptoRandom();
  }

  const restoredBinder = {
    ...defaultBinder(originalBinder.name || "Restored Binder"),
    ...originalBinder,
    id: restoredId,
    pages: Math.max(1, Number(originalBinder.pages) || 1),
  };

  state.binders.push(restoredBinder);

  const movedMap = new Map((entry.cards || []).map((item) => [item.id, item]));
  state.cards = state.cards.map((card) => {
    const prev = movedMap.get(card.id);
    if (!prev) return card;
    return {
      ...card,
      binderId: restoredId,
      page: clamp(Number(prev.page) || 1, 1, restoredBinder.pages),
      slotOrder: Number(prev.slotOrder) || getNextSlotOrder(restoredId, Number(prev.page) || 1),
    };
  });

  state.removedBinders = (state.removedBinders || []).filter((item) => item.id !== entryId);
  persist();
  refreshBinderSelects();
  renderCollection();
  renderBinderManager();
  status(`${restoredBinder.name} and card placements restored.`);
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
      const slotImage = slot.querySelector("img");
      if (slotImage) {
        applyCardArtFrame(slotImage, binder);
      }
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

function applyCardArtFrame(imageNode, binder) {
  if (!imageNode) return;
  const fit = cleanText(binder?.cardImageFit) || "cover";
  const zoom = clamp(Number(binder?.cardImageZoom) || 100, 80, 180);
  const focusX = clamp(Number(binder?.cardImageFocusX) || 50, 0, 100);
  const focusY = clamp(Number(binder?.cardImageFocusY) || 50, 0, 100);

  imageNode.style.objectFit = fit === "stretch" ? "fill" : fit;
  imageNode.style.objectPosition = `${focusX}% ${focusY}%`;
  imageNode.style.transform = `scale(${(zoom / 100).toFixed(3)})`;
  imageNode.style.transformOrigin = `${focusX}% ${focusY}%`;
}

function getPageCardSizing(binder, pageTheme) {
  return {
    scale: clamp(Number(pageTheme?.cardScale) || Number(binder?.cardScale) || 86, 65, 120),
    gap: clamp(Number(pageTheme?.cardGap) || Number(binder?.cardGap) || 8, 4, 18),
  };
}

function getCardSizePresetKey(scale, gap) {
  const match = Object.entries(CARD_SIZE_PRESETS).find(([, preset]) => {
    return Number(scale) === Number(preset.scale) && Number(gap) === Number(preset.gap);
  });
  return match?.[0] || "custom";
}

function applyCardSizePresetToPage(binder, page, presetKey) {
  const preset = CARD_SIZE_PRESETS[presetKey];
  if (!binder || !preset) return;
  const theme = upsertPageTheme(binder, page);
  theme.cardScale = preset.scale;
  theme.cardGap = preset.gap;
}

function resizePanelWithAutoAnchor(theme, panelId, nextColSpan, nextRowSpan) {
  const colSpan = clamp(Number(nextColSpan) || 1, 1, 3);
  const rowSpan = clamp(Number(nextRowSpan) || 1, 1, 3);
  return theme.scenePanels.map((panel) => {
    if (panel.id !== panelId) return panel;
    const shape = { ...panel, colSpan, rowSpan };
    const anchor = findNearestValidPanelAnchor(theme, panel.id, panel.anchor, shape);
    const candidate = { ...shape, anchor };
    return isPanelPlacementValid(theme.scenePanels, candidate, panel.id) ? candidate : panel;
  });
}

function handleClickMoveSelection(binder, page, targetSlot, targetCard) {
  if (!binder) return;
  const active = runtime.slotMove;

  if (!active || active.binderId !== binder.id || active.page !== page) {
    if (!targetCard) {
      status("Select a card first, then click a destination slot.");
      return;
    }
    runtime.slotMove = { binderId: binder.id, page, cardId: targetCard.id };
    renderCollection();
    status(`Selected ${targetCard.name}. Click another slot to move it.`);
    return;
  }

  if (active.cardId === targetCard?.id) {
    runtime.slotMove = null;
    renderCollection();
    status("Move selection cleared.");
    return;
  }

  const moved = moveCardWithSlotShift(active.cardId, binder.id, page, targetSlot);
  runtime.slotMove = null;
  if (!moved) {
    renderCollection();
    return;
  }

  persist();
  renderCollection();
  renderBinderManager();
}

function moveCardWithSlotShift(cardId, binderId, page, targetSlot) {
  const binder = state.binders.find((item) => item.id === binderId);
  if (!binder) return false;

  const safePage = clamp(Number(page) || 1, 1, Math.max(1, Number(binder.pages || 1)));
  const theme = getPageTheme(binder, safePage);
  const availableSlots = getAvailableSlotsForTheme(theme);
  const target = clamp(Number(targetSlot) || 1, 1, 9);
  if (!availableSlots.includes(target)) {
    status("That slot is reserved by the current page art layout.");
    return false;
  }

  const card = state.cards.find((item) => item.id === cardId);
  if (!card) return false;
  if (card.binderId !== binderId || Number(card.page || 1) !== safePage) {
    placeCardInSlot(cardId, binderId, safePage, target);
    return true;
  }

  const slotCards = availableSlots.map((slot) => {
    const found = state.cards.find(
      (item) => item.binderId === binderId
        && Number(item.page || 1) === safePage
        && Number(item.slotOrder || 0) === slot,
    );
    return found?.id || null;
  });

  const sourceIndex = slotCards.findIndex((id) => id === cardId);
  const targetIndex = availableSlots.indexOf(target);
  if (sourceIndex === -1 || targetIndex === -1) return false;
  if (sourceIndex === targetIndex) return true;

  const movingId = slotCards[sourceIndex];
  if (!movingId) return false;
  slotCards[sourceIndex] = null;

  if (targetIndex > sourceIndex) {
    for (let i = sourceIndex; i < targetIndex; i += 1) {
      slotCards[i] = slotCards[i + 1];
    }
  } else {
    for (let i = sourceIndex; i > targetIndex; i -= 1) {
      slotCards[i] = slotCards[i - 1];
    }
  }
  slotCards[targetIndex] = movingId;

  const nextSlots = new Map();
  slotCards.forEach((id, index) => {
    if (!id) return;
    nextSlots.set(id, availableSlots[index]);
  });

  state.cards = state.cards.map((item) => {
    if (!nextSlots.has(item.id)) return item;
    return {
      ...item,
      slotOrder: nextSlots.get(item.id),
    };
  });

  status(`Moved ${card.name} to slot ${target} and aligned surrounding cards.`);
  return true;
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
    backgroundImageFit: ["cover", "contain", "stretch"].includes(cleanText(fromMap.backgroundImageFit)) ? cleanText(fromMap.backgroundImageFit) : "cover",
    backgroundImageZoom: clamp(Number(fromMap.backgroundImageZoom) || 100, 60, 260),
    backgroundImageFocusX: clamp(Number(fromMap.backgroundImageFocusX) || 50, 0, 100),
    backgroundImageFocusY: clamp(Number(fromMap.backgroundImageFocusY) || 50, 0, 100),
    cardScale: clamp(Number(fromMap.cardScale) || Number(binder.cardScale) || 86, 65, 120),
    cardGap: clamp(Number(fromMap.cardGap) || Number(binder.cardGap) || 8, 4, 18),
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
    backgroundImageFit: current.backgroundImageFit,
    backgroundImageZoom: current.backgroundImageZoom,
    backgroundImageFocusX: current.backgroundImageFocusX,
    backgroundImageFocusY: current.backgroundImageFocusY,
    cardScale: current.cardScale,
    cardGap: current.cardGap,
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
    video: "",
  };
  base.anchor = findNearestValidPanelAnchor(theme, null, base.anchor, base);
  return base;
}

function normalizeScenePanels(scenePanels, legacy = {}) {
  const list = Array.isArray(scenePanels) && scenePanels.length
    ? scenePanels
    : buildLegacyScenePanels(legacy);

  const normalized = list
    .map((panel, index) => normalizeScenePanel(panel, index))
    .filter(Boolean);

  const placed = [];
  normalized.forEach((panel) => {
    const anchor = findNearestPanelAnchorInGrid(placed, panel.anchor, panel.colSpan, panel.rowSpan);
    const candidate = { ...panel, anchor };
    if (isPanelPlacementValid(placed, candidate)) {
      placed.push(candidate);
    }
  });

  return placed;
}

function findNearestPanelAnchorInGrid(existingPanels, preferredAnchor, colSpan, rowSpan) {
  const preferred = clamp(Number(preferredAnchor) || 1, 1, 9);
  const safeColSpan = clamp(Number(colSpan) || 1, 1, 3);
  const safeRowSpan = clamp(Number(rowSpan) || 1, 1, 3);
  const candidates = Array.from({ length: 9 }, (_, index) => index + 1)
    .sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));

  for (const anchor of candidates) {
    const candidate = { anchor, colSpan: safeColSpan, rowSpan: safeRowSpan };
    const covered = getPanelCoveredSlots(candidate);
    if (covered.length !== safeColSpan * safeRowSpan) continue;
    if (isPanelPlacementValid(existingPanels, candidate)) return anchor;
  }

  return 1;
}

function getPanelGridPlacement(panel) {
  const colSpan = clamp(Number(panel?.colSpan) || 1, 1, 3);
  const rowSpan = clamp(Number(panel?.rowSpan) || 1, 1, 3);
  const rawColStart = ((clamp(Number(panel?.anchor) || 1, 1, 9) - 1) % 3) + 1;
  const rawRowStart = Math.ceil(clamp(Number(panel?.anchor) || 1, 1, 9) / 3);
  const colStart = clamp(rawColStart, 1, 4 - colSpan);
  const rowStart = clamp(rawRowStart, 1, 4 - rowSpan);
  return {
    colStart,
    rowStart,
    colEnd: colStart + colSpan,
    rowEnd: rowStart + rowSpan,
  };
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
    video: cleanText(panel.video),
    fit: ["cover", "contain", "stretch"].includes(cleanText(panel.fit)) ? cleanText(panel.fit) : "cover",
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

  if (cleanText(panel.video)) {
    const video = document.createElement("video");
    video.className = "panel-media-video";
    video.src = panel.video;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    const fit = cleanText(panel.fit) || "cover";
    video.style.objectFit = fit === "contain" ? "contain" : fit === "stretch" ? "fill" : "cover";
    video.style.objectPosition = `${clamp(Number(panel.focusX) || 50, 0, 100)}% ${clamp(Number(panel.focusY) || 50, 0, 100)}%`;
    scene.insertBefore(video, scene.firstChild);
  }

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
    const placement = getPanelGridPlacement(panel);
    const node = document.createElement("button");
    node.type = "button";
    node.className = "panel-layout-scene";
    node.dataset.panelId = panel.id;
    node.style.gridColumn = `${placement.colStart} / ${placement.colEnd}`;
    node.style.gridRow = `${placement.rowStart} / ${placement.rowEnd}`;
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
  const fit = cleanText(panel?.fit) || "cover";
  const hasImageLayer = !!(cleanText(panel?.image) || cleanText(pageTheme?.sceneImage) || cleanText(pageTheme?.backgroundImage));
  const imageLayerSize = fit === "contain" ? "contain" : fit === "stretch" ? "100% 100%" : `${zoom}%`;

  node.style.backgroundImage = buildScenePanelBackground(pageTheme, panel);
  if (hasImageLayer) {
    node.style.backgroundSize = `cover, ${imageLayerSize}, cover`;
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
  const bgLayerStyle = getPageBackgroundLayerStyle(pageTheme);
  grid.style.backgroundColor = pageTheme.pageTint || "#0f1d2f";
  grid.style.backgroundImage = buildPageBackgroundImage(pageTheme, pageDoodle);
  grid.style.backgroundSize = bgLayerStyle.size;
  grid.style.backgroundPosition = bgLayerStyle.position;
  grid.style.backgroundRepeat = bgLayerStyle.repeat;
  grid.style.setProperty("--page-rim", pageTheme.sleeveColor || "#9cdfff");
  grid.style.setProperty("--page-glow", getMethodGlow(pageTheme.method, pageTheme.sleeveColor));
}

function getPageBackgroundLayerStyle(pageTheme) {
  const hasBackgroundImage = !!cleanText(pageTheme?.backgroundImage);
  const fit = cleanText(pageTheme?.backgroundImageFit) || "cover";
  const zoom = clamp(Number(pageTheme?.backgroundImageZoom) || 100, 60, 260);
  const focusX = clamp(Number(pageTheme?.backgroundImageFocusX) || 50, 0, 100);
  const focusY = clamp(Number(pageTheme?.backgroundImageFocusY) || 50, 0, 100);
  const imageLayerSize = fit === "contain"
    ? "contain"
    : fit === "stretch"
      ? "100% 100%"
      : `${zoom}%`;

  if (hasBackgroundImage) {
    return {
      size: `cover, ${imageLayerSize}, 220px 220px, 18px 18px`,
      position: `center, ${focusX}% ${focusY}%, center, center`,
      repeat: "no-repeat, no-repeat, repeat, repeat",
    };
  }

  return {
    size: "cover, 220px 220px, 18px 18px",
    position: "center, center, center",
    repeat: "no-repeat, repeat, repeat",
  };
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

function buildPagePreviewStyle(pageTheme) {
  const bgLayerStyle = getPageBackgroundLayerStyle(pageTheme);
  const previewSize = bgLayerStyle.size.replace(", 18px 18px", "");
  const previewPosition = bgLayerStyle.position.replace(", center", "");
  const previewRepeat = bgLayerStyle.repeat.replace(", repeat", "");
  return `background-image:${buildPagePreviewBackground(pageTheme)}; background-size:${previewSize}; background-position:${previewPosition}; background-repeat:${previewRepeat};`;
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

  // Pricing (raw value trend chart) is paused for now — see analysisValues in scan.js.
  chartWrap.innerHTML = "";

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
    archiveRemovedCard(card, "list-remove");
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
  // Pricing (raw/graded value, P/L) is paused for now — see analysisValues
  // in scan.js.
  const total = state.cards.length;
  const avgGrade = total ? state.cards.reduce((s, c) => s + c.grade, 0) / total : 0;
  const invested = state.cards.filter((c) => c.purchasePrice != null);

  els.collectionSummary.innerHTML = `
    <div><span>Total Cards</span><strong>${total}</strong></div>
    <div><span>Average Grade</span><strong>${total ? avgGrade.toFixed(2) : "-"}</strong></div>
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


function getBinderLabel(binderId) {
  return state.binders.find((binder) => binder.id === binderId)?.coverTitle
    || state.binders.find((binder) => binder.id === binderId)?.name
    || "Binder";
}

