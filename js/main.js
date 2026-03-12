const STOCK_API_URL_LOT14 = "https://script.googleusercontent.com/macros/echo?user_content_key=AY5xjrTgBxnO1IclzVaCKZQFYa6s2bdy5-P3mkXbZ3RAtXAqMAQjMPdY8dpViT_8VrZS9pnpBiJ82boO1qqfYxv7FmzXHKY70Tl45OF1cAe3c_q6MOvz9xh6dVIgNDkuaAclU9wjfvQnKizDFbzN4GYnShC2wi4W5zK1FSkACpUEY2eHcWko2uZ5YMeIP8Z677fxVGDinkLp1BJkeh3fHlo8DXJTT0vFwdavjBFapogzBH74PCmRuqwmkGqOg_RHJkhhWHUvPMrOSQWHIZmT2m5AcG1g6uA0X6uM3Jwbgpfr&lib=MVOlFOQifs0OUpm_BBCpYhnP66jA_5D0B";
const STOCK_API_URL_LOT13 = "https://script.google.com/macros/s/AKfycbyUy421vy_AY3Uqm-9i8Td4-K5sOqV0EwmHVZEvOPPqbfCyYZcDd0q-cyupHgbUtfg0qQ/exec";

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

  // อัปเดตข้อความ "อัปเดตล่าสุด / Last updated" ทันทีหลังสลับภาษา (ไม่ต้อง fetch ใหม่)
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
}

function getI18n() {
  const lang = document.documentElement.lang || "th";
  return texts[lang] || texts.th;
}

function isMobileLayout() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 480px)").matches;
}

function formatUpdatedText(t, updatedAt) {
  if (!updatedAt) return "";
  // มือถือ: ซ่อนคำว่า "อัปเดตล่าสุด/Last updated" เหลือเฉพาะวันเวลา เพื่อลดการดันเลย์เอาต์ในช่องแคบ
  if (isMobileLayout()) return `(${updatedAt})`;
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

async function loadNkStock({ url, bannerId, headingId, updatedId, companyValueId, clinicValueId, defaultHeading }) {
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

    bannerEl.dataset.state = "ok";
  } catch (error) {
    console.error("โหลดข้อมูลสต็อคไม่สำเร็จ", error);
    companyEl.textContent = t.stockLoadError;
    clinicEl.textContent = "–";
    updatedEl.textContent = "";
    bannerEl.dataset.state = "error";
    delete bannerEl.dataset.updatedAt;
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
  loadNkStock({
    url: STOCK_API_URL_LOT13,
    bannerId: "nk-stock-banner-lot13",
    headingId: "nk-stock-heading-lot13",
    updatedId: "nk-stock-updated-lot13",
    companyValueId: "nk-stock-company-value-lot13",
    clinicValueId: "nk-stock-clinic-value-lot13",
    defaultHeading: "NK VUE TUBE LOT 13",
  });
  loadNkStock({
    url: STOCK_API_URL_LOT14,
    bannerId: "nk-stock-banner",
    headingId: "nk-stock-heading",
    updatedId: "nk-stock-updated",
    companyValueId: "nk-stock-company-value",
    clinicValueId: "nk-stock-clinic-value",
    defaultHeading: "NK VUE TUBE LOT 14",
  });

  // ถ้าหมุนจอ/เปลี่ยนขนาดหน้าจอ ให้ re-render ข้อความอัปเดตให้เหมาะกับมือถือ/เดสก์ท็อปทันที (ไม่ต้อง fetch ใหม่)
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
});