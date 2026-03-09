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
    document.getElementById("nk-link").textContent = t.nk;
    document.getElementById("masuyama-link").textContent = t.masuyama;
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
  });