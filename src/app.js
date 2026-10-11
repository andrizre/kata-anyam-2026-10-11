import { generatePoem, makeShareUrl, poemToText, THEMES, FORMS } from "./poem-engine.js";

const $ = (selector) => document.querySelector(selector);
const ui = {
  form: $("#poem-form"), seed: $("#seed-input"), theme: $("#theme-select"), shape: $("#form-select"),
  title: $("#poem-title"), lines: $("#poem-lines"), seedLabel: $("#poem-seed"), meta: $("#poem-meta"),
  index: $("#poem-index"), copy: $("#copy-button"), save: $("#save-button"), download: $("#download-button"),
  surprise: $("#surprise-button"), toast: $("#toast"), saved: $("#saved-list"), savedCount: $("#saved-count"), clear: $("#clear-saved-button"),
};
const WORDS = ["embun", "halte", "kemangi", "purnama", "peron", "layang-layang", "serambi", "rintik", "pohon", "jendela", "kompas", "pagi"];
let lexicon;
let currentPoem;
let poemNumber = 1;
let toastTimer;

function readSaved() {
  try {
    const data = JSON.parse(localStorage.getItem("kata-anyam:rak") || "[]");
    return Array.isArray(data) ? data.filter((item) => item && Array.isArray(item.lines) && typeof item.title === "string") : [];
  } catch { return []; }
}

function showToast(message) {
  ui.toast.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast.textContent = ""; }, 2200);
}

function renderPoem(poem, increment = true) {
  currentPoem = poem;
  if (increment) poemNumber += 1;
  ui.title.textContent = poem.title;
  ui.lines.replaceChildren(...poem.lines.map((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    return paragraph;
  }));
  ui.seedLabel.textContent = poem.seed;
  ui.meta.innerHTML = `${THEMES[poem.theme].toLocaleUpperCase("id-ID")} <span>·</span> ${FORMS[poem.form].label.toLocaleUpperCase("id-ID")}`;
  ui.index.textContent = `· ${String(poemNumber).padStart(3, "0")}`;
  ui.seed.value = poem.seed;
  ui.theme.value = poem.theme;
  ui.shape.value = poem.form;
  ui.save.setAttribute("aria-label", `Simpan puisi: ${poem.title}`);
  history.replaceState(null, "", makeShareUrl(poem, location.href.split("?")[0]));
}

function compose() {
  const poem = generatePoem({ seed: ui.seed.value, theme: ui.theme.value, form: ui.shape.value, lexicon });
  renderPoem(poem);
  return poem;
}

function renderSaved() {
  const poems = readSaved();
  ui.savedCount.textContent = `(${poems.length})`;
  ui.clear.hidden = poems.length === 0;
  if (poems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.innerHTML = "Puisi favoritmu akan menetap di sini. Tekan <strong>Simpan</strong> untuk menyimpannya.";
    ui.saved.replaceChildren(empty);
    return;
  }
  ui.saved.replaceChildren(...poems.map((poem, index) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    const title = document.createElement("h3"); title.textContent = poem.title;
    const excerpt = document.createElement("p"); excerpt.textContent = poem.lines.join(" ");
    const meta = document.createElement("small"); meta.textContent = `${THEMES[poem.theme] || "Puisi".toLocaleUpperCase("id-ID")} · ${poem.seed}`;
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-saved"; remove.textContent = "×";
    remove.setAttribute("aria-label", `Hapus puisi ${poem.title} dari rak`); remove.dataset.removeIndex = String(index);
    card.append(title, excerpt, meta, remove);
    return card;
  }));
}

ui.form.addEventListener("submit", (event) => { event.preventDefault(); compose(); showToast("Puisi baru selesai dianyam."); });
ui.surprise.addEventListener("click", () => {
  ui.seed.value = WORDS[Math.floor(Math.random() * WORDS.length)];
  const themes = Object.keys(THEMES);
  ui.theme.value = themes[Math.floor(Math.random() * themes.length)];
  const forms = Object.keys(FORMS);
  ui.shape.value = forms[Math.floor(Math.random() * forms.length)];
  compose();
  showToast("Benih kejutan sudah tumbuh.");
});
ui.copy.addEventListener("click", async () => {
  const text = poemToText(currentPoem);
  try {
    await navigator.clipboard.writeText(text);
    showToast("Puisi disalin ke papan klip.");
  } catch {
    const area = document.createElement("textarea"); area.value = text; area.setAttribute("readonly", "");
    area.style.position = "fixed"; area.style.opacity = "0"; document.body.append(area); area.select();
    const copied = document.execCommand("copy"); area.remove();
    showToast(copied ? "Puisi disalin ke papan klip." : "Pilih teks puisi untuk menyalin.");
  }
});
ui.save.addEventListener("click", () => {
  const poems = readSaved();
  const same = poems.some((poem) => poem.seed === currentPoem.seed && poem.theme === currentPoem.theme && poem.form === currentPoem.form);
  if (same) { showToast("Puisi ini sudah ada di rak."); return; }
  try {
    localStorage.setItem("kata-anyam:rak", JSON.stringify([currentPoem, ...poems].slice(0, 30)));
    renderSaved(); showToast("Puisi disimpan di rak kata.");
  } catch { showToast("Penyimpanan browser tidak tersedia."); }
});
ui.download.addEventListener("click", () => {
  const blob = new Blob([poemToText(currentPoem)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `kata-anyam-${currentPoem.seed.replace(/[^\p{L}\p{N}-]+/gu, "-").toLowerCase()}.txt`;
  anchor.click(); URL.revokeObjectURL(url); showToast("Berkas .txt siap diunduh.");
});
ui.saved.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-index]");
  if (!button) return;
  const poems = readSaved(); poems.splice(Number(button.dataset.removeIndex), 1);
  localStorage.setItem("kata-anyam:rak", JSON.stringify(poems)); renderSaved();
});
ui.clear.addEventListener("click", () => {
  localStorage.removeItem("kata-anyam:rak"); renderSaved(); showToast("Rak kata sudah dikosongkan.");
});

async function init() {
  try {
    const response = await fetch("./src/lexicon.json");
    if (!response.ok) throw new Error(`kamus gagal dimuat (${response.status})`);
    lexicon = await response.json();
    const params = new URLSearchParams(location.search);
    if (params.has("seed")) ui.seed.value = params.get("seed");
    if (Object.hasOwn(THEMES, params.get("theme"))) ui.theme.value = params.get("theme");
    if (Object.hasOwn(FORMS, params.get("form"))) ui.shape.value = params.get("form");
    compose();
    renderSaved();
  } catch (error) {
    ui.title.textContent = "Kamus belum terbuka";
    ui.lines.textContent = error.message;
  }
}

init();
