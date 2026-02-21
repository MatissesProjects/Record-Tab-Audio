# Implementation Plan: Extension UI

- [x] **Step 5.1: Popup Structure & Styling**
  - Create `popup.html` and `popup.css`.
  - Add to `manifest.json`.
- [x] **Step 5.2: UI Logic (TypeScript)**
  - Create `src/popup.ts`.
  - Implement messaging to trigger recording from the UI.
- [x] **Step 5.3: Status Monitoring**
  - Sync state between background/offscreen and the popup.
  - Display "Recording..." and status dots.
- [x] **Step 5.4: Settings Integration**
  - Add inputs for silence threshold and duration.
  - Persist settings via `chrome.storage`.
