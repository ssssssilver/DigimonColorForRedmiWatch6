# Changelog

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
