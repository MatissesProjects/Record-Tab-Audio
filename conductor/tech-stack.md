# Tech Stack: Tab Audio Capture & Auto-Splitter

## Frontend (Chrome Extension)
- **Manifest**: V3
- **Background**: Service Worker (Background Coordinator)
- **Recorder**: Offscreen Document (Offscreen Recorder)
- **Audio Analysis**: Web Audio API (AnalyserNode)
- **Audio Capture**: `chrome.tabCapture.getMediaStreamId()` & `navigator.mediaDevices.getUserMedia()`
- **Media Recorder**: `MediaRecorder` API (audio/webm;codecs=opus)
- **Messaging**: `chrome.runtime.sendMessage` & `chrome.runtime.onMessage`

## Backend (Local Processor)
- **Server**: Python (Flask or FastAPI)
- **Audio Conversion**: FFmpeg
- **Port**: 5000 (default)
- **Endpoint**: POST `/upload-track`
- **Output**: MP3 (192k bitrate, 44100Hz sample rate)

## Dependencies
- Chrome browser (Offscreen API support)
- Python 3.x
- FFmpeg installed locally
