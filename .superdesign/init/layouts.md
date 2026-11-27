# Shared Layout Components

## App Shell (`dist/index.html`)
Renders the top header (brand mark + Undo button), stage step strip (`<nav class="steps">`), main dynamic screen outlet (`<section id="screen">`), and collapsible racer reference catalog (`<details id="catalog">`).

```html
<main>
  <header>
    <div class="brand">
      <span class="mark" aria-hidden="true">⚄</span>
      <div>Race Companion<br><small>Untuk Magical Athlete</small></div>
    </div>
    <button id="undo">Undo</button>
  </header>
  <nav class="steps" aria-label="Tahap permainan"></nav>
  <section id="screen"></section>
  <details id="catalog">
    <summary>Daftar atlet dan kekuatan</summary>
    <p class="muted">Magical Athlete · CMYK 2025</p>
    <label><span>Cari nama atlet</span><input type="search" id="catalog-search" placeholder="Contoh: Alchemist"></label>
    <div id="catalog-results"></div>
    <p><a style="color:#d9cbff" href="https://www.rulespal.com/magical-athlete/rulebook#racer-info" target="_blank" rel="noopener">Rulebook</a> · <a style="color:#d9cbff" href="https://iello.fr/athletes-de-compete-tatillon-repond-a-vos-questions/" target="_blank" rel="noopener">FAQ dan klarifikasi aturan</a></p>
  </details>
</main>
```
