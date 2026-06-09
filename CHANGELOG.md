# Changelog

## 0.4.7 - 2026-06-09

- Strengthened `npm run qa:first-release` with release-version consistency checks, touch-target sizing checks, runtime no-network assertions, no version-switch UI assertion, timer cleanup assertions, and built-RPK presence validation.
- Expanded the automated P4 readiness coverage so first-release QA now guards more device contract requirements before handoff.

## 0.4.6 - 2026-06-09

- Added `npm run qa:first-release` as a first-version readiness gate covering watch layout, the eight home entries, battle sequence UI hooks, cleanup/heal feedback, recovery confirmation, key care actions, Quest battle, and a 30-minute simulated run.
- Updated the README current candidate and local verification commands to include the first-release QA gate.

## 0.4.5 - 2026-06-08

- Added a short three-step battle sequence before the result screen: battle entry, projectile jump, and hit/dodge feedback.
- Kept battle labels Chinese-facing while preserving the original-style short occupied-stage rhythm.
- Refined Clean Waste and Heal feedback so successful cleanup/recovery uses stronger central effect panels than no-op actions.

## 0.4.4 - 2026-06-08

- Added schema v4 recovery confirmation for abnormal clock changes and long offline catch-up caps.
- Added a central Recovery panel so players can confirm capped recovery before continuing normal care.
- Added short full-stage action feedback panels for feeding, cleaning, healing, lights, Cold Mode, Call, Backup, and recovery.
- Expanded smoke coverage for schema v4 migration and recovery confirmation clearing.

## 0.4.3 - 2026-06-04

- Expanded the watch LCD to the full 432 x 514 device canvas so the app no longer appears as a smaller centered square on real hardware.
- Enlarged the home rails, module controls, training bar, battle sprites, and central pet sprite for better real-device readability.
- Increased the main pet sprite from 168px to 236px and gave the released space to the central stage.

## 0.4.2 - 2026-06-04

- Recalibrated the watch layout for the 432 x 514 REDMI Watch 6 device canvas instead of the earlier 480 design-width scaling.
- Enlarged and centered the LCD viewport on the page so the pet screen fills the real device more closely.
- Increased the central stage and sprite sizes to match the larger LCD viewport.

## 0.4.1 - 2026-06-04

- Updated the formal v5 home rail to the manual-aligned eight entries: Status, Food, Training, Battles, Clean Waste, Sleep, Heal, and Call.
- Moved Lights, Cold Mode, and Backup under the Sleep central module instead of keeping Light and Cold as home entries.
- Added a Call feedback action that records the press and highlights active calls without directly clearing care state.
- Added schema defaults and smoke coverage for `lightsOff`, Call feedback, and the Backup placeholder.

## 0.4.0 - 2026-06-04

- Started the formal v5 UI development line from the updated quick-app, 8-module, and battle UI documents.
- Reworked the watch home screen into an 8-module LCD rail: Status/Data, Food, Train, Battle, WC, Med, Light, and Cold, with DATA removed as a ninth home entry.
- Moved Food, Status, Train, Battle, Cold, Sleep, and reset actions into the central LCD stage so secondary controls no longer replace or crowd the bottom rail.
- Replaced unsupported simulator glyphs in the icon rail with Vela-safe visible markers while keeping Chinese two-character labels.

## 0.3.7 - 2026-06-04

- Fixed the watch home layout by adding stable stage and bottom-rail slots so top and bottom command rails no longer collapse together during rapid mode changes.
- Kept the existing mode-specific bottom commands inside a fixed-height rail container to reduce Vela conditional-layout churn.

## 0.3.6 - 2026-06-03

- Reworked the training screen into a visible timing-bar interaction with clear charging cells, success/failure colors, and direct result text.
- Added center-screen and bottom-rail training stop handling so training can be completed by tapping the training stage or the `停止判定` command.
- Added training availability preview rules for blocked states such as Cold Mode, Sleep, sickness, and injury.
- Fixed the LCD stage panels to use stable heights instead of relying on Vela flex-grow behavior.
- Documented first-version operation notes, including the training flow and local build/debug commands.

## 0.3.5 - 2026-06-03

- Added first-pass Energy, Protein feed, Protein Overdose, training count, stage training, stage battle, injury count, and medicine dose fields with old-save migration defaults.
- Updated training so success and failure both count, every four trainings grant Effort, and successful training restores Strength instead of consuming it.
- Added battle Energy checks and consumption, plus Protein Overdose-influenced injury risk.
- Expanded status/data output and smoke coverage for the new first-version gameplay rules.

## 0.3.4 - 2026-06-03

- Added Humulos Ver.5 idle animation asset extraction for frame1/frame2 sprites and committed the generated dual-frame runtime assets.
- Switched the home idle display from same-sprite positional toggling to hard cuts between `idle-1.png` and `idle-2.png`.
- Extended data and smoke tests to require Ver.5 dual-frame idle assets.

## 0.3.3 - 2026-06-03

- Replaced one-character Chinese UI labels with clearer action labels across the watch command rails and submenus.
- Expanded feeding feedback copy so runtime messages read as complete Chinese phrases instead of abbreviated symbols.

## 0.3.2 - 2026-06-03

- Removed the idle LCD ground line after simulator review because it read as an unnecessary center divider.
- Switched visible game UI copy and runtime feedback to Chinese by default.

## 0.3.1 - 2026-06-03

- Adjusted the LCD stage ground line so the pet stands on it instead of having the line float above the sprite.

## 0.3.0 - 2026-06-03

- Reworked the home screen toward the video-evidence DMC Color UI: light square LCD, internal top/bottom icon rails, and a larger central pet stage.
- Removed the default top HUD, HUN/POW readout, EVO strip, and bottom command button layer from the idle home screen.
- Made icon rails drive actions directly, with active/hot icon states for selected functions and care calls.
- Added the EVO countdown to the Status screen now that default home no longer shows it.

## 0.2.5 - 2026-06-03

- Added short LCD-stage feedback for care actions such as food, toilet, medicine, light, Cold Mode, and blocked battle starts.
- Kept feedback in the pet stage instead of relying on the bottom command text, matching the updated quick-app design direction.

## 0.2.4 - 2026-06-03

- Aligned the Vela design width with the updated quick-app design document.
- Made storage schema fallback use the current game schema instead of the old v1 default.
- Added immediate save-on-hide and save-on-destroy handling for the main pet screen.

## 0.2.3 - 2026-06-03

- Removed unregistered reference pages and their page-only helpers/styles from the runtime source tree.
- Removed local GIF sprite backups; runtime keeps the PNG sprites validated by the game data.
- Deleted an unused untracked product-plan draft from the workspace.

## 0.2.2 - 2026-06-03

- Fixed Cold Mode to pause age and evolution deadlines instead of only blocking hunger, strength, and poop ticks.
- Added `coldStartedAt` state migration and bumped the internal save schema to v2.
- Expanded smoke tests to cover Cold Mode evolution pause and old cold-save migration.

## 0.2.1 - 2026-06-03

- Switched the default Vela debug target to the square REDMI Watch simulator.
- Aligned the app design width to the 432 px REDMI Watch 6 canvas.
- Added explicit square and round Vela debug scripts for simulator switching.

## 0.2.0 - 2026-06-03

- Reworked the watch home screen around a simplified pet-first LCD idle view.
- Removed persistent MENU, A/B key decoration, DIGITAL MONSTER branding strip, skyline blocks, thick meter boxes, and the full-width EVO status bar.
- Added a weak TAP trigger, compact bottom command layer, one-line HUN/POW readout, larger idle sprite presentation, and state-aware Cold/Sleep command trimming.

## 0.1.1 - 2026-06-03

- Stabilized simulator controls by replacing dynamic command-list buttons with explicit Vela input controls.
- Added a dedicated MENU button for simulator and watch interaction.
- Verified round Vela emulator gameplay flow through MENU and FOOD submenu.

## 0.1.0 - 2026-06-03

- Added the first playable Xiaomi Vela quick app implementation for REDMI Watch 6.
- Implemented the Ver.5-only pet loop: save/load, hatch, feeding, training, toilet, medicine, sleep/light, Cold Mode, evolution, death, and rebirth.
- Added a watch-adapted command menu, FOOD submenu, training stop mini-game, Battle preview/confirm/result flow, status/data view, and reset confirmation.
- Added local Ver.5 data, sprites, Quest battle data, data validation, smoke tests, and Vela build scripts.
- Built the first debug RPK: `dist/com.learning.multivpet.dmcwatch.debug.0.1.0.rpk`.
