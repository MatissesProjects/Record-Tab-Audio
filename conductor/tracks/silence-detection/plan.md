# Implementation Plan: Silence Detection & Splitting

## Phase 2: Silence Detection & Auto-Splitting
### Milestone 2: Accurate "Silence Detected!" printed to console between songs.

- [x] **Step 2.1: Initialize AnalyserNode**
  - Inside `offscreen.js`, connect the audio stream to a Web Audio API `AnalyserNode`.
- [x] **Step 2.2: The RMS Loop**
  - Use `requestAnimationFrame` to constantly poll the frequency data.
  - Calculate the Root Mean Square (RMS) volume level.
- [x] **Step 2.3: The Split Trigger**
  - If the RMS drops below a specific threshold for a sustained duration (e.g., 2.5 seconds), trigger a split.
  - Command the `MediaRecorder` to stop the current track and immediately start recording a new one.
- [x] **Step 2.4: Validation (Console Output)**
  - Ensure "Silence Detected!" is printed accurately when no sound is playing.
