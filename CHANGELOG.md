# Changelog

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
