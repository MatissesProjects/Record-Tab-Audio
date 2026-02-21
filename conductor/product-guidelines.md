# Product Guidelines: Tab Audio Capture & Auto-Splitter

## General Principles
- **Privacy & Security**: Only capture audio from the user-selected tab. No data should be sent to external servers; the Python backend must run locally.
- **Reliability**: The auto-splitting feature should be robust against temporary silence (e.g., short pauses within a song) and only trigger on intentional gaps between tracks.
- **User Experience**: The extension should be simple to use (click to start/stop). Visual feedback should be provided via the extension icon or console logs for debugging.
- **Maintainability**: Code should be well-commented, especially the Web Audio API and FFmpeg integration parts.
- **Efficiency**: The Web Audio RMS loop should be optimized to minimize CPU usage while active.
