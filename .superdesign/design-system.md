# Magical Athlete — Race Companion Design System (Design DNA v1)

## 1. Product Context & Goal
Pendamping meja (tabletop companion) untuk **Magical Athlete (edisi CMYK 2025)**. Satu orang memegang HP atau tablet di meja, memasukkan hasil dadu fisik, menyelesaikan efek berurutan bersama engine (`referee.js`), dan mencocokkan pion fisik dengan posisi terhitung.

**North Star Sekilas Pandang:**
Saat layar dilihat sekilas, pemain langsung tahu:
1. **Siapa yang bertindak** (Atlet aktif + pemilik + posisi sekarang)
2. **Apa yang harus dilakukan sekarang** (Satu panel tugas aktif berbatas tegas, bebas distraksi)
3. **Efek apa yang baru terjadi** (Ringkasan kalimat singkat + posisi petak & skor terkini)

## 2. Sumber Kebenaran & Resolusi Konflik (DNA v1 × Superdesign Option A)
Sistem visual ini menyelaraskan **Design DNA v1** (`design-dna/magical-athlete.dna.json`, diekstrak dari foto produk resmi CMYK 2025 + rulebook hlm. 10–11) dengan struktur layar **Option A** yang telah dikunci pada iterasi sebelumnya:
1. **Warna & Tipografi → Design DNA v1 menang.** Semua token warna, font, radius, border, shadow, dan motion mengikuti `design-dna/magical-athlete.dna.json`.
2. **Layout & Struktur Layar → Superdesign Option A menang.** Layar Race tetap memakai urutan Option A (`race-head` → panel tugas fokus → baru terjadi → grid petak 0–30 + baris posisi → disclosure sekunder; desktop 2 kolom `>= 860px`, target sentuh `>= 44 px`, bebas sticky action bar, bebas scroll horizontal).
3. **Wild Wilds (`#F46D57`) berstatus provisional.** Sisi balik track fisik belum terukur di DNA v1; `#F46D57` coral dipertahankan sebagai penanda sementara **Wild Wilds** dengan catatan eksplisit di layar Pre-race (`"Wild: warna provisional, menunggu referensi track"`), bukan warna resmi Wild.
4. **Kebersihan & Tekstur:** Bidang datar jenuh (flat fills, tanpa gradien). Tekstur titik cetak (halftone) dibatasi hanya pada banner dekoratif Setup dan header Podium Hasil; area aksi Race, kartu atlet, tombol dadu, dan petak track tetap rata bersih.
5. **Tanpa Aset Berhak Cipta:** Tidak ada ilustrasi Angela Kirkwood atau logo CMYK yang digambar ulang/ditempel. Area art kartu atlet memakai inisial huruf display + dadu SVG geometris; ikon lain memakai SVG/CSS geometris orisinal.

## 3. Color Tokens (Design DNA v1 + Kalibrasi Pemakaian WCAG AA)
Nilai hex DNA tidak pernah diubah; untuk pasangan warna yang kontras teks putihnya `< 4.5:1` pada ukuran kecil, **pemakaian foreground/permukaannya** disesuaikan agar 100% lolos WCAG 2.1 AA:

- `--color-primary: #F01C03` — Merah box CMYK (header band & CTA utama). Teks `#FFFFFF` wajib Display/Large (`>= 24 px` `Titan One` dengan outline/shadow `#180A03`, kontras `4.31:1` AA Large); label kecil di atas merah memakai `#180A03` (`4.50:1` AA) atau ditempatkan dalam pill `#180A03`.
- `--color-secondary: #FED42C` — Kuning brand (bidang utama halaman, highlight, tahap aktif). Teks `#180A03` (`13.54:1` AA).
- `--color-accent: #20A1BF` — Teal podium (**Mild Mile**, **Podium #1**, info/link). Wajib memakai tinta `#180A03` (`6.38:1` AA), bukan teks putih kecil (`3.04:1`).
- `--color-paper: #FCFBED` — Off-white hangat kartu & panel (`18.61:1` vs `#180A03`).
- `--color-white: #FFFFFF` — Permukaan elevated (input, tombol dadu, highlight) (`19.38:1` vs `#180A03`).
- `--color-ink: #180A03` — Tinta hangat teks utama, outline `2–3 px solid`, hard shadow, serta panel hitam hero / Team Tray / `.race-head`.
- `--color-ink-soft: #4D3B25` — Teks sekunder di atas `#FCFBED` (`10.25:1`), `#FFFFFF` (`10.67:1`), dan `#FED42C` (`7.45:1`).
- `--color-success: #558B07` — Hijau sukses (tahap selesai, stempel `DRAFTED!`, outline pilihan aktif). Teks memakai `#180A03` (`4.69:1` AA) pada ukuran kecil, atau `#FFFFFF` hanya pada display `>= 24 px`.
- `--color-warning: #EB8212` — Oranye peringatan (**Podium #3**, badge pre-race, Egg). Teks `#180A03` (`7.14:1` AA).
- `--color-error: #E94107` — Merah-oranye error & tersandung. Pesan error disajikan sebagai banner berlatar `#E94107` dengan teks `#180A03` (`4.82:1` AA; hindari teks `#E94107` tipis langsung di atas `#FCFBED`).
- `--color-info: #599CCF` — Biru info & track space (`6.54:1` vs `#180A03`).
- `--color-pink: #DF76A5` — Pink kartu/track space (`6.71:1` vs `#180A03`).
- `--color-purple: #8D55CE` — Ungu **Podium #2** & kartu (`4.86:1` vs `#FFFFFF`; satu-satunya warna palet yang memakai teks putih).
- `--color-wild: #F46D57` *(provisional)* — Penanda sementara **Wild Wilds** (`6.62:1` vs `#180A03`).
- **Palet 8 Warna Racer:** `['#E94107', '#558B07', '#DF76A5', '#599CCF', '#EB8212', '#8D55CE', '#20A1BF', '#FED42C']` (Banana = `#FED42C`, Egg = `#EB8212`). Dalam satu race, dua atlet dihindari berbagi warna token yang sama.

## 4. Tipografi
- **Display / Headings / CTA / Seluruh Angka:** `'Titan One', 'Bungee', 'Arial Black', sans-serif` — extra-bold, hand-drawn wobble, all-caps; teks putih di atas merah/hitam memakai outline & hard shadow `#180A03`. Semua angka (skor, nomor petak, dadu, peringkat, nomor tahap/kursi) wajib memakai display face.
- **Body / UI / Labels:** `'Nunito', 'Segoe UI', system-ui, sans-serif` (`>= 16 px` pada body dan input/select/textarea agar bebas auto-zoom iOS Safari).
- **Skala & Efek:** Judul section utama memakai huruf-per-huruf pelangi (`#F01C03, #558B07, #599CCF, #DF76A5, #FED42C, #EB8212, #8D55CE, #20A1BF`) di atas panel hitam `#180A03`.

## 5. Shape, Motion, Komponen & Option A
- **Shape & Elevation:** Radius `8 px` (small), `14 px` (card/button), `20 px` (hero/tray), `999 px` (pill). Border tegas `2–3 px solid #180A03`. Hard offset shadow `2px 2px 0 #180A03` (low), `4px 4px 0 #180A03` (medium), `8px 8px 0 rgba(24,10,3,0.9)` (high). Tanpa blur shadow, tanpa gradien, tanpa hairline.
- **Motion:** Easing elastis `cubic-bezier(0.34, 1.56, 0.64, 1)`, durasi `120 ms / 250 ms / 500 ms`. Tombol squash saat ditekan, kartu pop-in/tilt halus saat hover, dadu bergetar (`die-shake`) saat dipilih, dan Canvas 2D confetti burst (`120–200` keping warna palet racer + putih) saat draft penuh / podium Stage 6. `@media (prefers-reduced-motion: reduce)` menonaktifkan confetti, rotasi/tilt, dan transisi.
- **Target Sentuh & Option A:**
  - Minimal `44 × 44 px` pada seluruh kontrol interaktif (dadu `>= 64 px` tinggi).
  - Layar Race `< 860 px`: `.race-head` (panel hitam `#180A03`) → `.action-panel` → Baru terjadi → Peta petak 0–30 & Daftar posisi atlet → Disclosure sekunder. Desktop `>= 860 px`: 2 kolom seimbang.
  - Focus ring kontras tinggi (`3px solid #180A03` + halo `#FED42C`) dan `#live-announcer` (`aria-live="polite"`) tetap terjaga.
