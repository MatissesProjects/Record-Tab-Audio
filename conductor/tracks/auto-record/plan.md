# Implementation Plan: Auto-Record Feature

- [x] **Step 6.1: UI Toggle for Auto-Record**
  - Add "Auto-Record" toggle to `popup.html`.
  - Update `src/popup.ts` to handle the new mode.
- [ ] **Step 6.2: Refactor Offscreen Capture**
  - Separate audio capture (getting the stream) from the `MediaRecorder` start/stop logic.
  - Implement a state machine: `IDLE` -> `WAITING_FOR_AUDIO` -> `RECORDING` -> `SILENCE_DETECTED`.
- [ ] **Step 6.3: Auto-Trigger Logic**
  - In "Waiting" mode, trigger `mediaRecorder.start()` when RMS exceeds the threshold.
  - Automatically stop/split when silence is detected for the configured duration.
- [ ] **Step 6.4: State Persistence & Sync**
  - Use `chrome.storage` to remember if Auto-Record is enabled.
  - Ensure background and popup stay in sync with the current state.
