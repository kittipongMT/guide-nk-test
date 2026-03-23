const STOCK_API_URL_LOT14 =
  "https://script.google.com/macros/s/AKfycbz1F7VtJHCQx1gQhxWuna1zuS-HaqhmzuOCg9mpUth6LYPDmoGpTNokqrPqlHJlLxnlTQ/exec";
const STOCK_API_URL_LOT13 =
  "https://script.google.com/macros/s/AKfycbyUy421vy_AY3Uqm-9i8Td4-K5sOqV0EwmHVZEvOPPqbfCyYZcDd0q-cyupHgbUtfg0qQ/exec";

/** @type {Array<Record<string, unknown>>} */
let nkLot13ClinicBreakdown = [];
/** @type {Array<Record<string, unknown>>} */
let nkLot14ClinicBreakdown = [];
let lot13ClinicSearchQuery = "";
let lot14ClinicSearchQuery = "";
let lot13ClinicSuggestions = [];
let lot14ClinicSuggestions = [];
let expandedLot13ClinicKey = "";
let expandedLot14ClinicKey = "";

const CLINIC_TABLE_COLS = [
  { keys: ["order"], labelKey: "stockColOrder" },
  { keys: ["clinicName", "name", "clinic"], labelKey: "stockColClinic" },
  { keys: ["remaining"], labelKey: "stockColRemaining" },
];

function firstDefined(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      return row[k];
    }
  }
  return "";
}

function formatBreakdownCell(value) {
  if (value === null || value === undefined || value === "") return "–";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return String(value);
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function getClinicName(row) {
  return String(firstDefined(row, ["clinicName", "name", "clinic"]) || "").trim();
}

function getClinicKey(row) {
  return normalizeText(getClinicName(row));
}

function normalizeTubeNoToken(value) {
  return String(value || "").trim();
}

function parseTubeNosFromUnknown(raw) {
  if (Array.isArray(raw)) {
    return raw.map(normalizeTubeNoToken).filter(Boolean);
  }
  const text = String(raw || "").trim();
  if (!text) return [];
  return text
    .split(/[\n,]/g)
    .map(normalizeTubeNoToken)
    .filter(Boolean);
}

function getRemainingTubeNos(row) {
  const raw = firstDefined(row, [
    "remainingTubeNos",
    "remainingTubeNumbers",
    "tubeNumbers",
    "tubeNoList",
    "tubeNos",
    "remainingTubeNoCsv",
  ]);
  return parseTubeNosFromUnknown(raw);
}

function getRemainingNumeric(row) {
  const raw = firstDefined(row, ["remaining"]);
  if (raw === "" || raw === null || raw === undefined) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function isZeroRemainingRow(row) {
  return getRemainingNumeric(row) === 0;
}

function buildClinicSuggestionsFrom(breakdown, queryText) {
  if (!queryText) return [];
  const seen = new Set();
  const starts = [];
  const includes = [];
  for (const row of breakdown) {
    const name = getClinicName(row);
    if (!name) continue;
    const key = normalizeText(name);
    if (!key || seen.has(key)) continue;
    if (key.startsWith(queryText)) {
      seen.add(key);
      starts.push(name);
    } else if (key.includes(queryText)) {
      seen.add(key);
      includes.push(name);
    }
  }
  return starts.concat(includes).slice(0, 8);
}

function queryMatchesFullClinicName(queryNorm, breakdown) {
  if (!queryNorm) return false;
  return breakdown.some((row) => normalizeText(getClinicName(row)) === queryNorm);
}

function getFilteredClinicRows(breakdown, searchQueryRaw) {
  const query = normalizeText(searchQueryRaw);
  let list = query
    ? breakdown.filter((row) => normalizeText(getClinicName(row)).includes(query))
    : breakdown;
  if (!query) {
    list = list.filter((row) => !isZeroRemainingRow(row));
  }
  return list;
}

function hideSuggestionList(suggestId) {
  const suggestEl = document.getElementById(suggestId);
  if (!suggestEl) return;
  suggestEl.hidden = true;
  suggestEl.innerHTML = "";
}

function updateLot13Suggestions() {
  const suggestEl = document.getElementById("nk-clinic-search-suggest-lot13");
  if (!suggestEl) return;
  const query = normalizeText(lot13ClinicSearchQuery);
  if (!query) {
    lot13ClinicSuggestions = [];
    hideSuggestionList("nk-clinic-search-suggest-lot13");
    return;
  }
  if (queryMatchesFullClinicName(query, nkLot13ClinicBreakdown)) {
    lot13ClinicSuggestions = [];
    hideSuggestionList("nk-clinic-search-suggest-lot13");
    return;
  }
  lot13ClinicSuggestions = buildClinicSuggestionsFrom(nkLot13ClinicBreakdown, query);
  if (!lot13ClinicSuggestions.length) {
    hideSuggestionList("nk-clinic-search-suggest-lot13");
    return;
  }
  const frag = document.createDocumentFragment();
  for (const name of lot13ClinicSuggestions) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nk-clinic-suggest-item";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      lot13ClinicSearchQuery = name;
      const inputEl = document.getElementById("nk-clinic-search-input-lot13");
      if (inputEl) inputEl.value = name;
      hideSuggestionList("nk-clinic-search-suggest-lot13");
      fillLot13ClinicTable();
      if (inputEl) inputEl.focus();
    });
    li.appendChild(btn);
    frag.appendChild(li);
  }
  suggestEl.innerHTML = "";
  suggestEl.appendChild(frag);
  suggestEl.hidden = false;
}

function updateLot14Suggestions() {
  const suggestEl = document.getElementById("nk-clinic-search-suggest-lot14");
  if (!suggestEl) return;
  const query = normalizeText(lot14ClinicSearchQuery);
  if (!query) {
    lot14ClinicSuggestions = [];
    hideSuggestionList("nk-clinic-search-suggest-lot14");
    return;
  }
  if (queryMatchesFullClinicName(query, nkLot14ClinicBreakdown)) {
    lot14ClinicSuggestions = [];
    hideSuggestionList("nk-clinic-search-suggest-lot14");
    return;
  }
  lot14ClinicSuggestions = buildClinicSuggestionsFrom(nkLot14ClinicBreakdown, query);
  if (!lot14ClinicSuggestions.length) {
    hideSuggestionList("nk-clinic-search-suggest-lot14");
    return;
  }
  const frag = document.createDocumentFragment();
  for (const name of lot14ClinicSuggestions) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nk-clinic-suggest-item";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      lot14ClinicSearchQuery = name;
      const inputEl = document.getElementById("nk-clinic-search-input-lot14");
      if (inputEl) inputEl.value = name;
      hideSuggestionList("nk-clinic-search-suggest-lot14");
      fillLot14ClinicTable();
      if (inputEl) inputEl.focus();
    });
    li.appendChild(btn);
    frag.appendChild(li);
  }
  suggestEl.innerHTML = "";
  suggestEl.appendChild(frag);
  suggestEl.hidden = false;
}

function syncLot13ClinicModalChrome() {
  const t = getI18n();
  const detailBtn = document.getElementById("nk-stock-detail-lot13");
  if (detailBtn && t.stockClinicDetailBtn) detailBtn.textContent = t.stockClinicDetailBtn;
  const titleEl = document.getElementById("nk-clinic-dialog-title-lot13");
  if (titleEl && t.stockClinicDetailTitle) titleEl.textContent = t.stockClinicDetailTitle;
  const doneBtn = document.getElementById("nk-clinic-dialog-done-lot13");
  if (doneBtn && t.stockModalClose) doneBtn.textContent = t.stockModalClose;
  const closeX = document.getElementById("nk-clinic-dialog-close-lot13");
  if (closeX && t.stockModalClose) closeX.setAttribute("aria-label", t.stockModalClose);
  const searchInput = document.getElementById("nk-clinic-search-input-lot13");
  if (searchInput && t.stockClinicSearchPlaceholder) {
    searchInput.placeholder = t.stockClinicSearchPlaceholder;
    searchInput.setAttribute("aria-label", t.stockClinicSearchPlaceholder);
  }
  const dlg = document.getElementById("nk-clinic-dialog-lot13");
  if (dlg && typeof dlg.open === "boolean" && dlg.open) {
    fillLot13ClinicTable();
  }
}

function syncLot14ClinicModalChrome() {
  const t = getI18n();
  const detailBtn = document.getElementById("nk-stock-detail-lot14");
  if (detailBtn && t.stockClinicDetailBtn) detailBtn.textContent = t.stockClinicDetailBtn;
  const titleEl = document.getElementById("nk-clinic-dialog-title-lot14");
  if (titleEl && t.stockClinicDetailTitleLot14) titleEl.textContent = t.stockClinicDetailTitleLot14;
  const doneBtn = document.getElementById("nk-clinic-dialog-done-lot14");
  if (doneBtn && t.stockModalClose) doneBtn.textContent = t.stockModalClose;
  const closeX = document.getElementById("nk-clinic-dialog-close-lot14");
  if (closeX && t.stockModalClose) closeX.setAttribute("aria-label", t.stockModalClose);
  const searchInput = document.getElementById("nk-clinic-search-input-lot14");
  if (searchInput && t.stockClinicSearchPlaceholder) {
    searchInput.placeholder = t.stockClinicSearchPlaceholder;
    searchInput.setAttribute("aria-label", t.stockClinicSearchPlaceholder);
  }
  const dlg = document.getElementById("nk-clinic-dialog-lot14");
  if (dlg && typeof dlg.open === "boolean" && dlg.open) {
    fillLot14ClinicTable();
  }
}

function fillLot13ClinicTable() {
  const t = getI18n();
  const emptyEl = document.getElementById("nk-clinic-dialog-empty-lot13");
  const wrapEl = document.getElementById("nk-clinic-table-wrap-lot13");
  const headEl = document.getElementById("nk-clinic-table-head-lot13");
  const bodyEl = document.getElementById("nk-clinic-table-body-lot13");
  if (!emptyEl || !wrapEl || !headEl || !bodyEl) return;

  const rows = nkLot13ClinicBreakdown;
  const queryNorm = normalizeText(lot13ClinicSearchQuery);
  const filteredRows = getFilteredClinicRows(nkLot13ClinicBreakdown, lot13ClinicSearchQuery);
  if (!rows.length) {
    emptyEl.hidden = false;
    emptyEl.textContent = t.stockClinicDetailEmpty || "";
    wrapEl.hidden = true;
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";
    return;
  }
  if (!filteredRows.length) {
    emptyEl.hidden = false;
    emptyEl.textContent = queryNorm
      ? t.stockClinicDetailNoMatch || ""
      : t.stockClinicDetailNoPositiveRemaining || t.stockClinicDetailNoMatch || "";
    wrapEl.hidden = true;
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";
    return;
  }

  emptyEl.hidden = true;
  wrapEl.hidden = false;

  const trHead = document.createElement("tr");
  for (const col of CLINIC_TABLE_COLS) {
    const th = document.createElement("th");
    th.textContent = t[col.labelKey] || col.labelKey;
    trHead.appendChild(th);
  }
  headEl.innerHTML = "";
  headEl.appendChild(trHead);

  const frag = document.createDocumentFragment();
  for (const row of filteredRows) {
    const rowKey = getClinicKey(row);
    const tubeNos = getRemainingTubeNos(row);
    const isExpandable = tubeNos.length > 0;
    const isExpanded = isExpandable && expandedLot13ClinicKey === rowKey;
    const tr = document.createElement("tr");
    tr.className = "nk-clinic-row";
    if (isExpandable) tr.classList.add("is-expandable");
    if (isExpanded) tr.classList.add("is-expanded");
    for (const col of CLINIC_TABLE_COLS) {
      const td = document.createElement("td");
      td.textContent = formatBreakdownCell(firstDefined(row, col.keys));
      if (col.labelKey === "stockColClinic") {
        td.classList.add("nk-clinic-cell-name");
      }
      tr.appendChild(td);
    }
    frag.appendChild(tr);
    if (isExpandable) {
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.setAttribute("aria-expanded", String(isExpanded));
      const onToggle = () => {
        expandedLot13ClinicKey = expandedLot13ClinicKey === rowKey ? "" : rowKey;
        fillLot13ClinicTable();
      };
      tr.addEventListener("click", onToggle);
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      });
    }
    if (isExpanded) {
      const detailTr = document.createElement("tr");
      detailTr.className = "nk-clinic-row-detail";
      const detailTd = document.createElement("td");
      detailTd.colSpan = CLINIC_TABLE_COLS.length;
      const listText = tubeNos.length ? tubeNos.join(", ") : t.stockTubeListEmpty || "";
      detailTd.textContent = `${t.stockTubeListPrefix || ""}: ${listText}`;
      detailTr.appendChild(detailTd);
      frag.appendChild(detailTr);
    }
  }
  bodyEl.innerHTML = "";
  bodyEl.appendChild(frag);
}

function fillLot14ClinicTable() {
  const t = getI18n();
  const emptyEl = document.getElementById("nk-clinic-dialog-empty-lot14");
  const wrapEl = document.getElementById("nk-clinic-table-wrap-lot14");
  const headEl = document.getElementById("nk-clinic-table-head-lot14");
  const bodyEl = document.getElementById("nk-clinic-table-body-lot14");
  if (!emptyEl || !wrapEl || !headEl || !bodyEl) return;

  const rows = nkLot14ClinicBreakdown;
  const queryNorm = normalizeText(lot14ClinicSearchQuery);
  const filteredRows = getFilteredClinicRows(nkLot14ClinicBreakdown, lot14ClinicSearchQuery);
  if (!rows.length) {
    emptyEl.hidden = false;
    emptyEl.textContent = t.stockClinicDetailEmpty || "";
    wrapEl.hidden = true;
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";
    return;
  }
  if (!filteredRows.length) {
    emptyEl.hidden = false;
    emptyEl.textContent = queryNorm
      ? t.stockClinicDetailNoMatch || ""
      : t.stockClinicDetailNoPositiveRemaining || t.stockClinicDetailNoMatch || "";
    wrapEl.hidden = true;
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";
    return;
  }

  emptyEl.hidden = true;
  wrapEl.hidden = false;

  const trHead = document.createElement("tr");
  for (const col of CLINIC_TABLE_COLS) {
    const th = document.createElement("th");
    th.textContent = t[col.labelKey] || col.labelKey;
    trHead.appendChild(th);
  }
  headEl.innerHTML = "";
  headEl.appendChild(trHead);

  const frag = document.createDocumentFragment();
  for (const row of filteredRows) {
    const rowKey = getClinicKey(row);
    const tubeNos = getRemainingTubeNos(row);
    const isExpandable = tubeNos.length > 0;
    const isExpanded = isExpandable && expandedLot14ClinicKey === rowKey;
    const tr = document.createElement("tr");
    tr.className = "nk-clinic-row";
    if (isExpandable) tr.classList.add("is-expandable");
    if (isExpanded) tr.classList.add("is-expanded");
    for (const col of CLINIC_TABLE_COLS) {
      const td = document.createElement("td");
      td.textContent = formatBreakdownCell(firstDefined(row, col.keys));
      if (col.labelKey === "stockColClinic") {
        td.classList.add("nk-clinic-cell-name");
      }
      tr.appendChild(td);
    }
    frag.appendChild(tr);
    if (isExpandable) {
      tr.setAttribute("role", "button");
      tr.setAttribute("tabindex", "0");
      tr.setAttribute("aria-expanded", String(isExpanded));
      const onToggle = () => {
        expandedLot14ClinicKey = expandedLot14ClinicKey === rowKey ? "" : rowKey;
        fillLot14ClinicTable();
      };
      tr.addEventListener("click", onToggle);
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      });
    }
    if (isExpanded) {
      const detailTr = document.createElement("tr");
      detailTr.className = "nk-clinic-row-detail";
      const detailTd = document.createElement("td");
      detailTd.colSpan = CLINIC_TABLE_COLS.length;
      const listText = tubeNos.length ? tubeNos.join(", ") : t.stockTubeListEmpty || "";
      detailTd.textContent = `${t.stockTubeListPrefix || ""}: ${listText}`;
      detailTr.appendChild(detailTd);
      frag.appendChild(detailTr);
    }
  }
  bodyEl.innerHTML = "";
  bodyEl.appendChild(frag);
}

function openLot13ClinicDialog() {
  const dlg = document.getElementById("nk-clinic-dialog-lot13");
  if (!dlg || typeof dlg.showModal !== "function") return;
  const inputEl = document.getElementById("nk-clinic-search-input-lot13");
  lot13ClinicSearchQuery = "";
  expandedLot13ClinicKey = "";
  if (inputEl) inputEl.value = "";
  updateLot13Suggestions();
  fillLot13ClinicTable();
  dlg.showModal();
  if (inputEl && typeof inputEl.focus === "function") inputEl.focus();
}

function closeLot13ClinicDialog() {
  const dlg = document.getElementById("nk-clinic-dialog-lot13");
  if (!dlg || typeof dlg.close !== "function") return;
  dlg.close();
}

function openLot14ClinicDialog() {
  const dlg = document.getElementById("nk-clinic-dialog-lot14");
  if (!dlg || typeof dlg.showModal !== "function") return;
  const inputEl = document.getElementById("nk-clinic-search-input-lot14");
  lot14ClinicSearchQuery = "";
  expandedLot14ClinicKey = "";
  if (inputEl) inputEl.value = "";
  updateLot14Suggestions();
  fillLot14ClinicTable();
  dlg.showModal();
  if (inputEl && typeof inputEl.focus === "function") inputEl.focus();
}

function closeLot14ClinicDialog() {
  const dlg = document.getElementById("nk-clinic-dialog-lot14");
  if (!dlg || typeof dlg.close !== "function") return;
  dlg.close();
}

function setLanguage(lang, isUserClick) {
  const t = texts[lang];
  if (!t) return;

  if (isUserClick) {
    document.body.classList.add("lang-switching");
  }
  document.documentElement.lang = lang;

  document.getElementById("main-title").textContent = t.title;
  document.getElementById("page-subtitle").textContent = t.subtitle;
  document.getElementById("contact-heading").textContent = t.contact;
  document.getElementById("label-line").textContent = t.line;
  document.getElementById("line-link").textContent = t.lineLink;
  document.getElementById("label-line-id").textContent = t.lineIdLabel;
  document.getElementById("label-email").textContent = t.email;
  document.getElementById("label-address").textContent = t.address;
  document.getElementById("address").textContent = t.addressVal;
  document.getElementById("label-hours").textContent = t.hours;
  document.getElementById("hours").textContent = t.hoursVal;
  document.getElementById("nk-link-text").textContent = t.nk;
  document.getElementById("masuyama-link-text").textContent = t.masuyama;
  const companyLabel14 = document.getElementById("nk-stock-company-label");
  const clinicLabel14 = document.getElementById("nk-stock-clinic-label");
  const companyLabel13 = document.getElementById("nk-stock-company-label-lot13");
  const clinicLabel13 = document.getElementById("nk-stock-clinic-label-lot13");
  if (companyLabel14) companyLabel14.textContent = t.stockCompany;
  if (clinicLabel14) clinicLabel14.textContent = t.stockClinic;
  if (companyLabel13) companyLabel13.textContent = t.stockCompany;
  if (clinicLabel13) clinicLabel13.textContent = t.stockClinic;
  const requestFormEl = document.getElementById("request-form-link");
  if (requestFormEl && t.requestForm) requestFormEl.textContent = t.requestForm;
  const requestFormLabelEl = document.getElementById("request-form-label");
  if (requestFormLabelEl && t.requestFormLabel) requestFormLabelEl.textContent = t.requestFormLabel;

  const btnTh = document.getElementById("btn-th");
  const btnEn = document.getElementById("btn-en");

  btnTh.classList.toggle("active", lang === "th");
  btnEn.classList.toggle("active", lang === "en");

  btnTh.setAttribute("aria-pressed", String(lang === "th"));
  btnEn.setAttribute("aria-pressed", String(lang === "en"));

  localStorage.setItem("site-language", lang);

  if (isUserClick) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove("lang-switching");
      });
    });
  }

  renderStockFromDataset({
    bannerId: "nk-stock-banner-lot13",
    headingId: "nk-stock-heading-lot13",
    updatedId: "nk-stock-updated-lot13",
    companyValueId: "nk-stock-company-value-lot13",
    clinicValueId: "nk-stock-clinic-value-lot13",
    defaultHeading: "NK VUE TUBE LOT 13",
  });
  renderStockFromDataset({
    bannerId: "nk-stock-banner",
    headingId: "nk-stock-heading",
    updatedId: "nk-stock-updated",
    companyValueId: "nk-stock-company-value",
    clinicValueId: "nk-stock-clinic-value",
    defaultHeading: "NK VUE TUBE LOT 14",
  });
  syncLot13ClinicModalChrome();
  syncLot14ClinicModalChrome();
}

function getI18n() {
  const lang = document.documentElement.lang || "th";
  return texts[lang] || texts.th;
}

function formatUpdatedText(t, updatedAt) {
  if (!updatedAt) return "";
  return `(${t.stockUpdated}: ${updatedAt})`;
}

function renderStockFromDataset({ bannerId, headingId, updatedId, companyValueId, clinicValueId, defaultHeading }) {
  const t = getI18n();
  const bannerEl = document.getElementById(bannerId);
  if (!bannerEl) return;

  const headingEl = document.getElementById(headingId);
  const updatedEl = document.getElementById(updatedId);
  const companyEl = document.getElementById(companyValueId);
  const clinicEl = document.getElementById(clinicValueId);

  if (headingEl) {
    headingEl.textContent = bannerEl.dataset.lotLabel || defaultHeading || headingEl.textContent;
  }

  if (companyEl && bannerEl.dataset.companyRemaining != null) {
    companyEl.textContent = `${bannerEl.dataset.companyRemaining} ${t.stockUnits}`;
  }
  if (clinicEl && bannerEl.dataset.clinicRemaining != null) {
    clinicEl.textContent = `${bannerEl.dataset.clinicRemaining} ${t.stockUnits}`;
  }
  if (updatedEl && bannerEl.dataset.updatedAt) {
    updatedEl.textContent = formatUpdatedText(t, bannerEl.dataset.updatedAt);
  }
}

async function loadNkStock({
  url,
  bannerId,
  headingId,
  updatedId,
  companyValueId,
  clinicValueId,
  defaultHeading,
  storeClinicBreakdown,
}) {
  const t = getI18n();
  const companyEl = document.getElementById(companyValueId);
  const clinicEl = document.getElementById(clinicValueId);
  const updatedEl = document.getElementById(updatedId);
  const headingEl = document.getElementById(headingId);
  const bannerEl = document.getElementById(bannerId);

  if (!companyEl || !clinicEl || !updatedEl || !bannerEl) return;

  if (headingEl && defaultHeading) headingEl.textContent = defaultHeading;

  companyEl.textContent = t.loading;
  clinicEl.textContent = "–";
  updatedEl.textContent = "";
  bannerEl.dataset.state = "loading";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Network error");

    const data = await res.json();

    if (data.lotLabel && headingEl) {
      headingEl.textContent = data.lotLabel;
    }
    if (data.lotLabel) {
      bannerEl.dataset.lotLabel = String(data.lotLabel);
    }

    if (data.companyRemaining != null && data.companyRemaining !== "") {
      companyEl.textContent = `${data.companyRemaining} ${t.stockUnits}`;
      bannerEl.dataset.companyRemaining = String(data.companyRemaining);
    } else {
      companyEl.textContent = t.notFound;
      delete bannerEl.dataset.companyRemaining;
    }

    if (data.clinicRemaining != null && data.clinicRemaining !== "") {
      clinicEl.textContent = `${data.clinicRemaining} ${t.stockUnits}`;
      bannerEl.dataset.clinicRemaining = String(data.clinicRemaining);
    } else {
      clinicEl.textContent = t.notFound;
      delete bannerEl.dataset.clinicRemaining;
    }

    if (data.updatedAt) {
      updatedEl.textContent = formatUpdatedText(t, data.updatedAt);
      bannerEl.dataset.updatedAt = String(data.updatedAt);
    }

    if (storeClinicBreakdown === "lot13") {
      nkLot13ClinicBreakdown = Array.isArray(data.clinicBreakdown) ? data.clinicBreakdown : [];
      const dlg = document.getElementById("nk-clinic-dialog-lot13");
      if (dlg && typeof dlg.open === "boolean" && dlg.open) {
        fillLot13ClinicTable();
      }
    }
    if (storeClinicBreakdown === "lot14") {
      nkLot14ClinicBreakdown = Array.isArray(data.clinicBreakdown) ? data.clinicBreakdown : [];
      const dlg = document.getElementById("nk-clinic-dialog-lot14");
      if (dlg && typeof dlg.open === "boolean" && dlg.open) {
        fillLot14ClinicTable();
      }
    }

    bannerEl.dataset.state = "ok";
  } catch (error) {
    console.error("โหลดข้อมูลสต็อคไม่สำเร็จ", error);
    companyEl.textContent = t.stockLoadError;
    clinicEl.textContent = "–";
    updatedEl.textContent = "";
    bannerEl.dataset.state = "error";
    delete bannerEl.dataset.updatedAt;
    if (storeClinicBreakdown === "lot13") {
      nkLot13ClinicBreakdown = [];
      const dlg = document.getElementById("nk-clinic-dialog-lot13");
      if (dlg && typeof dlg.open === "boolean" && dlg.open) {
        fillLot13ClinicTable();
      }
    }
    if (storeClinicBreakdown === "lot14") {
      nkLot14ClinicBreakdown = [];
      const dlg = document.getElementById("nk-clinic-dialog-lot14");
      if (dlg && typeof dlg.open === "boolean" && dlg.open) {
        fillLot14ClinicTable();
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-lang]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang, true);
    });
  });

  const savedLanguage = localStorage.getItem("site-language") || "th";
  setLanguage(savedLanguage, false);
  const lot13Config = {
    url: STOCK_API_URL_LOT13,
    bannerId: "nk-stock-banner-lot13",
    headingId: "nk-stock-heading-lot13",
    updatedId: "nk-stock-updated-lot13",
    companyValueId: "nk-stock-company-value-lot13",
    clinicValueId: "nk-stock-clinic-value-lot13",
    defaultHeading: "NK VUE TUBE LOT 13",
    storeClinicBreakdown: "lot13",
  };
  const lot14Config = {
    url: STOCK_API_URL_LOT14,
    bannerId: "nk-stock-banner",
    headingId: "nk-stock-heading",
    updatedId: "nk-stock-updated",
    companyValueId: "nk-stock-company-value",
    clinicValueId: "nk-stock-clinic-value",
    defaultHeading: "NK VUE TUBE LOT 14",
    storeClinicBreakdown: "lot14",
  };

  loadNkStock(lot13Config);
  loadNkStock(lot14Config);

  window.addEventListener("resize", () => {
    renderStockFromDataset({
      bannerId: "nk-stock-banner-lot13",
      headingId: "nk-stock-heading-lot13",
      updatedId: "nk-stock-updated-lot13",
      companyValueId: "nk-stock-company-value-lot13",
      clinicValueId: "nk-stock-clinic-value-lot13",
      defaultHeading: "NK VUE TUBE LOT 13",
    });
    renderStockFromDataset({
      bannerId: "nk-stock-banner",
      headingId: "nk-stock-heading",
      updatedId: "nk-stock-updated",
      companyValueId: "nk-stock-company-value",
      clinicValueId: "nk-stock-clinic-value",
      defaultHeading: "NK VUE TUBE LOT 14",
    });
  });

  async function handleStockRefresh(btnEl, config) {
    if (!btnEl) return;
    if (btnEl.disabled) return;
    btnEl.disabled = true;
    try {
      await loadNkStock(config);
    } finally {
      btnEl.disabled = false;
    }
  }

  const refreshLot13 = document.getElementById("nk-stock-refresh-lot13");
  const refreshLot14 = document.getElementById("nk-stock-refresh");
  if (refreshLot13) refreshLot13.addEventListener("click", () => handleStockRefresh(refreshLot13, lot13Config));
  if (refreshLot14) refreshLot14.addEventListener("click", () => handleStockRefresh(refreshLot14, lot14Config));

  const detailLot13 = document.getElementById("nk-stock-detail-lot13");
  if (detailLot13) detailLot13.addEventListener("click", () => openLot13ClinicDialog());
  const detailLot14 = document.getElementById("nk-stock-detail-lot14");
  if (detailLot14) detailLot14.addEventListener("click", () => openLot14ClinicDialog());

  const searchInputLot13 = document.getElementById("nk-clinic-search-input-lot13");
  if (searchInputLot13) {
    searchInputLot13.addEventListener("input", () => {
      lot13ClinicSearchQuery = searchInputLot13.value || "";
      updateLot13Suggestions();
      fillLot13ClinicTable();
    });
    searchInputLot13.addEventListener("focus", () => {
      updateLot13Suggestions();
    });
  }

  const searchInputLot14 = document.getElementById("nk-clinic-search-input-lot14");
  if (searchInputLot14) {
    searchInputLot14.addEventListener("input", () => {
      lot14ClinicSearchQuery = searchInputLot14.value || "";
      updateLot14Suggestions();
      fillLot14ClinicTable();
    });
    searchInputLot14.addEventListener("focus", () => {
      updateLot14Suggestions();
    });
  }

  const dlgLot13 = document.getElementById("nk-clinic-dialog-lot13");
  const closeLot13X = document.getElementById("nk-clinic-dialog-close-lot13");
  const doneLot13 = document.getElementById("nk-clinic-dialog-done-lot13");
  if (closeLot13X) closeLot13X.addEventListener("click", () => closeLot13ClinicDialog());
  if (doneLot13) doneLot13.addEventListener("click", () => closeLot13ClinicDialog());
  if (dlgLot13) {
    dlgLot13.addEventListener("pointerdown", (e) => {
      const searchRoot = document.getElementById("nk-clinic-search-lot13");
      if (searchRoot && searchRoot.contains(e.target)) return;
      hideSuggestionList("nk-clinic-search-suggest-lot13");
    });
    dlgLot13.addEventListener("click", (e) => {
      if (e.target === dlgLot13) closeLot13ClinicDialog();
    });
    dlgLot13.addEventListener("close", () => {
      lot13ClinicSearchQuery = "";
      lot13ClinicSuggestions = [];
      expandedLot13ClinicKey = "";
      const inputEl = document.getElementById("nk-clinic-search-input-lot13");
      const suggestEl = document.getElementById("nk-clinic-search-suggest-lot13");
      if (inputEl) inputEl.value = "";
      if (suggestEl) {
        suggestEl.hidden = true;
        suggestEl.innerHTML = "";
      }
      if (detailLot13 && typeof detailLot13.focus === "function") detailLot13.focus();
    });
  }

  const dlgLot14 = document.getElementById("nk-clinic-dialog-lot14");
  const closeLot14X = document.getElementById("nk-clinic-dialog-close-lot14");
  const doneLot14 = document.getElementById("nk-clinic-dialog-done-lot14");
  if (closeLot14X) closeLot14X.addEventListener("click", () => closeLot14ClinicDialog());
  if (doneLot14) doneLot14.addEventListener("click", () => closeLot14ClinicDialog());
  if (dlgLot14) {
    dlgLot14.addEventListener("pointerdown", (e) => {
      const searchRoot = document.getElementById("nk-clinic-search-lot14");
      if (searchRoot && searchRoot.contains(e.target)) return;
      hideSuggestionList("nk-clinic-search-suggest-lot14");
    });
    dlgLot14.addEventListener("click", (e) => {
      if (e.target === dlgLot14) closeLot14ClinicDialog();
    });
    dlgLot14.addEventListener("close", () => {
      lot14ClinicSearchQuery = "";
      lot14ClinicSuggestions = [];
      expandedLot14ClinicKey = "";
      const inputEl = document.getElementById("nk-clinic-search-input-lot14");
      const suggestEl = document.getElementById("nk-clinic-search-suggest-lot14");
      if (inputEl) inputEl.value = "";
      if (suggestEl) {
        suggestEl.hidden = true;
        suggestEl.innerHTML = "";
      }
      if (detailLot14 && typeof detailLot14.focus === "function") detailLot14.focus();
    });
  }
});
