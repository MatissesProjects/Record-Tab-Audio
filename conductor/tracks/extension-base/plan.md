# Implementation Plan: Extension Base & Audio Capture

## Phase 1: Chrome Extension (Frontend)
### Milestone 1: Record 10 seconds of audio and download locally as WebM.

- [x] **Step 1.1: manifest.json Setup**
  - Request permissions: `tabCapture`, `offscreen`.
  - Define the background service worker (`background.js`).
- [ ] **Step 1.2: The Background Coordinator (background.js)**
  - Listen for `chrome.action.onClicked`.
  - Call `chrome.tabCapture.getMediaStreamId()` to get the capture token.
  - Call `chrome.offscreen.createDocument()` to spawn `offscreen.html`.
  - Send the `streamId` to the offscreen document via Chrome messaging.
- [ ] **Step 1.3: The Offscreen Recorder (offscreen.html & offscreen.js)**
  - Receive the `streamId` and call `navigator.mediaDevices.getUserMedia()` to tap into the audio.
  - Route the audio to a new `AudioContext` destination so the tab doesn't mute itself.
  - Initialize `MediaRecorder` to start capturing the audio as `audio/webm;codecs=opus`.
- [ ] **Step 1.4: Validation (Local Download)**
  - Implement a simple way to stop and download the recording as a `.webm` file for initial verification.
