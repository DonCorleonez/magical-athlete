# Magical Athlete — Race Companion Design System

## 1. Product Context & Goal
Pendamping meja (tabletop companion) untuk **Magical Athlete (edisi CMYK 2025)**. Satu orang memegang HP atau tablet di meja, memasukkan hasil dadu fisik, menyelesaikan efek berurutan bersama engine (`referee.js`), dan mencocokkan pion fisik dengan posisi terhitung.

**North Star Sekilas Pandang:**
Saat layar dilihat sekilas, pemain langsung tahu:
1. **Siapa yang bertindak** (Atlet aktif + pemilik + posisi sekarang)
2. **Apa yang harus dilakukan sekarang** (Satu panel tugas aktif berbatas tegas, bebas distraksi)
3. **Efek apa yang baru terjadi** (Ringkasan kalimat singkat + posisi petak & skor terkini)

## 2. Arah Visual: Picture-Book Tabletop Print
Terinspirasi estetika buku cerita 1970-an / cetak CMYK pada rulebook *Magical Athlete* (judul padat berat, blok warna rata kontras tinggi, garis tepi tinta gelap, bayangan cetak offset tipis, elemen grafis abstrak buatan sendiri: pips dadu, garis lintasan, bintang, batu segitiga, panah arah, dan stempel medali).
- **Kebersihan Area Aksi:** Tekstur titik cetak (halftone) dibatasi hanya pada banner dekoratif Setup dan Header Podium Hasil. Area aksi Race, tombol dadu, dan tabel posisi tetap rata dan sangat bersih.
- **Tanpa Aset Berhak Cipta:** Tidak memakai ilustrasi karakter atau logo resmi CMYK. Semua ikon (dadu, bintang, batu, panah, medali) adalah SVG/CSS geometris orisinal.

## 3. Color Tokens (WCAG AA Calibrated)
- `--ink: #202023` — Teks utama, garis tepi `2px solid`, bayangan cetak `3px 3px 0 #202023`.
- `--ink-muted: #4A4952` — Label sekunder (`8.2:1` pada `--paper`).
- `--paper: #FFF5DE` — Latar halaman hangat (`14.95:1` kontras dengan `--ink`).
- `--surface: #FFFDF7` — Permukaan panel aksi & kartu bersih (`16.0:1` dengan `--ink`).
- `--paper-alt: #F3E5C3` — Strip petak netral & latar sekunder.
- `--yellow: #FFD24A` — Tombol aksi utama, stempel tahap aktif, Medali #1, aksen Wild Wilds (`11.18:1` dengan `--ink`).
- `--coral: #F46D57` — Identitas **Wild Wilds**, penanda alert/tersandung, dan aksen aktif dengan teks `#202023` (`5.23:1` WCAG AA pass).
- `--coral-soft: #FFE2DC` — Bidang lembut penanda efek/tersandung/target.
- `--teal: #38A89B` — Dikalibrasi dari `#258D81` (`4.30:1` < 4.5:1) ke `#38A89B` agar teks `#202023` mencapai **`5.82:1` WCAG AA pass**. Identitas **Mild Mile** & Medali #2.
- `--teal-deep: #18635A` — Teks/aksen teal di atas `--paper` (`6.23:1`).
- `--teal-soft: #D7F2EE` — Bidang tenang Mild Mile & badge tersedia.

## 4. Tipografi
- **Display / Headings / Angka Besar:** `'Archivo Black', 'Impact', 'Arial Black', sans-serif` — padat, tegas, mudah terbaca dari seberang meja.
- **Body / UI / Labels:** `'Atkinson Hyperlegible Next', 'Segoe UI', system-ui, sans-serif` — keterbacaan tinggi, membedakan angka `0/O`, `1/I/l`, `6/9`.
- **Skala & Aturan:**
  - Body & input/select/textarea: minimal `16px` (mencegah auto-zoom iOS Safari).
  - Label penting & badge status: minimal `14px`.
  - Angka posisi, dadu, dan poin: `font-variant-numeric: tabular-nums`.

## 5. Komponen & Tata Letak Mobile-First
- **Target Sentuh:** Semua tombol, pill pilihan, input, dan chip dadu minimal `44 × 44 px` (tombol dadu `1–6` minimal `56 px` tinggi, grid `3×2` di HP sempit dan `6×1` di layar lebar).
- **Layar Race (Keputusan Eksplorasi Option A):**
  - Urutan vertikal 390 px: **Headline Aktif Ringkas** → **Panel Tugas Aktif (Action Panel)** → **Baru Terjadi** → **Grid Petak Lintasan (0–30) & Daftar Posisi Atlet** → **Disclosure Sekunder** (Koreksi, Riwayat, Kartu).
  - Desktop (`≥ 860px`): Grid 2 kolom — Kiri (Headline + Panel Tugas + Baru Terjadi), Kanan (Papan Petak & Posisi + Disclosure).
  - **Stabilitas Tata Letak:** Tidak ada sticky action bar yang menutupi konten; tidak ada scroll horizontal halaman atau panel scroll bertingkat; tombol dadu tidak bergeser posisi.
- **Gerak & Aksesibilitas:**
  - Transisi singkat (`120ms–160ms ease-out`) hanya pada hover/press & progress bar, menghormati `@media (prefers-reduced-motion: reduce)`.
  - Focus ring kontras tinggi (`3px solid #202023` dengan `box-shadow: 0 0 0 5px #FFD24A`).
  - `#live-announcer` (`aria-live="polite"`) terpisah untuk mengumumkan pergantian giliran/tugas secara ringkas.
