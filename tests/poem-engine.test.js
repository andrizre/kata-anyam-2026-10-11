import test from "node:test";
import assert from "node:assert/strict";
import lexicon from "../src/lexicon.json" with { type: "json" };
import { createSeededRandom, generatePoem, makeShareUrl, normalizeSeed, poemToText, FORMS, THEMES } from "../src/poem-engine.js";

test("normalisasi memangkas spasi, merapatkan whitespace, dan memberi nilai bawaan", () => {
  assert.equal(normalizeSeed("  daun   jatuh \n"), "daun jatuh");
  assert.equal(normalizeSeed("   "), "kata");
  assert.equal(normalizeSeed("a".repeat(60)).length, 40);
});

test("generator seeded konsisten dan memisahkan urutan seed", () => {
  const first = createSeededRandom("pagi");
  const second = createSeededRandom("pagi");
  assert.deepEqual([first(), first(), first()], [second(), second(), second()]);
  assert.notEqual(createSeededRandom("pagi")(), createSeededRandom("malam")());
});

test("puisi deterministik untuk input sama dan menyertakan kata benih", () => {
  const input = { seed: "jendela", theme: "senja", form: "bait", lexicon };
  const poem = generatePoem(input);
  assert.deepEqual(poem, generatePoem(input));
  assert.equal(poem.lines.length, 4);
  assert.match(poem.lines[0], /jendela/);
  assert.equal(poem.theme, "senja");
});

test("semua kombinasi suasana dan bentuk menghasilkan jumlah baris yang benar", () => {
  for (const theme of Object.keys(THEMES)) {
    for (const form of Object.keys(FORMS)) {
      const poem = generatePoem({ seed: "embun", theme, form, lexicon });
      assert.equal(poem.lines.length, FORMS[form].lines, `${theme}/${form}`);
      assert.ok(poem.lines.every((line) => typeof line === "string" && line.length > 0));
    }
  }
});

test("input suasana dan bentuk yang tidak valid ditolak", () => {
  assert.throws(() => generatePoem({ seed: "a", theme: "asing", lexicon }), RangeError);
  assert.throws(() => generatePoem({ seed: "a", form: "panjang", lexicon }), RangeError);
  assert.throws(() => generatePoem({ seed: "a", theme: "senja" }), TypeError);
});

test("format teks dan tautan berbagi mempertahankan parameter", () => {
  const poem = generatePoem({ seed: "pohon kecil", theme: "hujan", form: "surat", lexicon });
  const text = poemToText(poem);
  assert.ok(text.includes(poem.title));
  assert.ok(text.includes(poem.lines.join("\n")));
  assert.ok(text.endsWith("— untuk kata pohon kecil"));
  const url = new URL(makeShareUrl(poem, "https://contoh.test/"));
  assert.equal(url.searchParams.get("seed"), "pohon kecil");
  assert.equal(url.searchParams.get("theme"), "hujan");
  assert.equal(url.searchParams.get("form"), "surat");
});
