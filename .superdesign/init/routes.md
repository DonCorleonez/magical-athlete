# Stage-Based Routes (`state.stage` in `dist/index.html` & `dist/table.js`)

Single-page static app routed by `state.stage` (0–6) persisted in `localStorage` (`race-companion-v1`).

- `stage === 0` (`Pemain` / Setup): Rendered in `dist/index.html` (`render()`). Player count (2–6), racers per player (1–6), clockwise seating names (`#setup`).
- `stage === 1` (`Snake draft`): Rendered in `dist/index.html` (`render()`). Active drafter turn, racer preset select / custom rule inputs, drafted roster grid (`#draft`).
- `stage === 2` (`Roster`): Rendered in `dist/index.html` (`roster()`). Player teams with editable card rules (`save-rules`) and transition to Race 1 selection.
- `stage === 3` (`Pilih atlet`): Rendered in `dist/index.html` (`render()`). Per-player racer selection for `state.round` (`#pick`).
- `stage === 4` (`Pre-race`): Rendered in `dist/table.js` (`tablePre()`). Track selector (`Mild Mile` / `Wild Wilds`), first player selector, medal point values, lineup preview (`#start`).
- `stage === 5` (`Race`): Rendered in `dist/table.js` (`tableRace()`). Active turn banner, single focused task panel (`.action-panel`), board positions, recent events, manual sync (`#gm-sync`), full log, card reference.
- `stage === 6` (`Hasil`): Rendered in `dist/table.js` (`tableResults()`). Race #1/#2 podium, cumulative leaderboard (`leaderboard()`), previous race podiums, next round or reset action.
