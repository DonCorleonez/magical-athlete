# Page Dependency Trees

## / (`dist/index.html`)
Entry: `dist/index.html`
Dependencies:
- `dist/powers.js` (global `racerPowers`)
- `dist/referee.js` (global `referee`)
- `dist/table.js` (globals `tablePre`, `tableRace`, `tableResults`, `refereeForm`)
  - Calls `esc`, `button`, `heading`, `field`, `numopts`, `athlete`, `availableRacers`, `roster`, `state` from `dist/index.html`
  - Calls `referee.*` from `dist/referee.js`
