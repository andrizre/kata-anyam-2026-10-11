# Kata Anyam

**Kata Anyam** adalah studio puisi mikro generatif: pilih sebuah kata benih, tentukan suasana dan bentuk, lalu rangkai puisi pendek yang bisa kamu simpan atau bagikan. Seluruh komposisi dibuat secara deterministik di browser—tanpa akun, API, atau layanan AI.

## Fitur

- **Empat suasana:** Senja, Hujan, Kota, dan Pulang.
- **Tiga bentuk:** Fragmen (3 baris), Bait (4 baris), dan Surat pendek (5 baris).
- **Benih kata personal:** menjadi jangkar pada baris pembuka dan tanda tangan puisi.
- **Hasil konsisten:** kombinasi benih, suasana, dan bentuk yang sama menghasilkan puisi yang sama; tautan berbagi menyimpan pilihan tersebut.
- **Rak kata lokal:** simpan hingga 30 puisi di penyimpanan browser, hapus satu per satu, atau kosongkan rak.
- **Salin dan unduh:** salin komposisi atau simpan sebagai berkas `.txt`.
- **Kejutan acak** untuk menemukan kombinasi baru.
- **Responsif dan aksesibel:** label formulir, status pembaca layar, tata letak ponsel, dan dukungan reduced motion.
- **Tanpa dependensi runtime:** halaman statis, kamus lokal, dan JavaScript native. Tidak ada proses build.

## Tech stack

- HTML5 semantik
- CSS3 responsif
- JavaScript ES modules
- JSON sebagai kamus pola dan kosakata
- Node.js test runner bawaan untuk tes unit

## Instalasi

Tidak perlu memasang paket. Siapkan **Python 3** untuk server lokal dan **Node.js 18+** hanya bila ingin menjalankan tes.

```bash
git clone https://github.com/andrizre/kata-anyam-2026-10-11.git
cd kata-anyam-2026-10-11
```

## Menjalankan

Dari direktori proyek, jalankan:

```bash
npm start
```

Buka [http://localhost:4173](http://localhost:4173). Alternatif tanpa npm:

```bash
python3 -m http.server 4173
```

Hentikan server dengan `Ctrl+C`. Setelah berkas proyek tersedia, pembangkitan puisi dan kamusnya bekerja lokal; koleksi tersimpan di `localStorage` browser yang sedang digunakan.

## Menjalankan tes

Dengan Node.js 18 atau lebih baru:

```bash
npm test
```

Tes mencakup normalisasi benih, kestabilan generator, seluruh kombinasi suasana/bentuk, validasi input, format teks, dan tautan berbagi.

## Struktur proyek

```text
.
├── index.html
├── styles.css
├── src/
│   ├── app.js
│   ├── lexicon.json
│   └── poem-engine.js
├── tests/
│   └── poem-engine.test.js
├── package.json
└── README.md
```

## Privasi

Kata yang dimasukkan tidak dikirim ke server. Puisi favorit tersimpan hanya di penyimpanan lokal browser dan tidak tersinkron antarperangkat. Tautan berbagi memuat benih, suasana, dan bentuk sebagai parameter URL.

## Lisensi

MIT — lihat [`LICENSE`](./LICENSE).
