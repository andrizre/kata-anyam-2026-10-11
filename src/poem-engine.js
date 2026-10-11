export const FORMS = Object.freeze({
  fragmen: { label: "Fragmen", lines: 3 },
  bait: { label: "Bait", lines: 4 },
  surat: { label: "Surat pendek", lines: 5 },
});

export const THEMES = Object.freeze({ senja: "Senja", hujan: "Hujan", kota: "Kota", pulang: "Pulang" });

export function normalizeSeed(value) {
  const seed = String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  return seed || "kata";
}

function hashText(text) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

export function createSeededRandom(seed) {
  let state = hashText(String(seed));
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function fillTemplate(template, words, random) {
  return template.replace(/\{([a-z]+)\}/g, (match, category) => {
    const choices = words[category];
    if (!Array.isArray(choices) || choices.length === 0) throw new Error(`Kamus tidak memiliki kategori kata: ${category}`);
    return choices[Math.floor(random() * choices.length)];
  });
}

export function generatePoem({ seed, theme = "senja", form = "fragmen", lexicon }) {
  const normalizedSeed = normalizeSeed(seed);
  if (!Object.hasOwn(THEMES, theme)) throw new RangeError(`Suasana tidak dikenal: ${theme}`);
  if (!Object.hasOwn(FORMS, form)) throw new RangeError(`Bentuk tidak dikenal: ${form}`);
  const collection = lexicon?.themes?.[theme];
  if (!collection?.templates?.length || !collection.words || !collection.titles?.length) {
    throw new TypeError(`Kamus untuk suasana “${theme}” tidak lengkap`);
  }
  const random = createSeededRandom(`${normalizedSeed}|${theme}|${form}`);
  const title = collection.titles[Math.floor(random() * collection.titles.length)];
  const templates = [...collection.templates].sort(() => random() - 0.5);
  const lines = Array.from({ length: FORMS[form].lines }, (_, index) =>
    fillTemplate(templates[index % templates.length], collection.words, random),
  );
  lines[0] = `Dari kata “${normalizedSeed}”, ${lines[0][0].toLocaleLowerCase("id-ID")}${lines[0].slice(1)}`;
  return { seed: normalizedSeed, theme, form, title, lines };
}

export function poemToText(poem) {
  return `${poem.title}\n\n${poem.lines.join("\n")}\n\n— untuk kata ${poem.seed}`;
}

export function makeShareUrl(poem, baseUrl) {
  const url = new URL(baseUrl);
  url.searchParams.set("seed", poem.seed);
  url.searchParams.set("theme", poem.theme);
  url.searchParams.set("form", poem.form);
  return url.toString();
}
