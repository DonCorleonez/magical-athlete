# Extractable Components

## AppHeader
- Source: `dist/index.html`
- Category: layout
- Description: Brand mark, companion title, and global Undo trigger
- Extractable props: undoDisabled (boolean, default: true), undoCount (number, default: 0)
- Hardcoded: Die pips logo mark SVG, "Race Companion" title

## StageStepper
- Source: `dist/index.html`
- Category: layout
- Description: 7-stage horizontal progress indicator for Setup through Results
- Extractable props: currentStage (number, default: 5)
- Hardcoded: Stage names ("Pemain", "Snake draft", "Roster", "Pilih atlet", "Pre-race", "Race", "Hasil")

## ActiveTurnPanel
- Source: `dist/table.js`
- Category: basic
- Description: Focused engine task panel (roll 1-6, Suckerfish/Flip Flop/reroll choice, confirmMove, duel, egg)
- Extractable props: taskType (string, default: "roll"), phaseLabel (string, default: "Lempar dadu")
- Hardcoded: Ink print borders, offset shadow, die pip icons
