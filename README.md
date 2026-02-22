# RecordTabAudio

RecordTabAudio is a Chrome Extension and local Python backend duo that captures audio from a browser tab and automatically segments it into high-quality MP3 tracks based on silence detection.

## Features

- **Tab Audio Capture**: Uses the Chrome Offscreen API to capture tab audio without muting it.
- **Silence Detection**: Real-time analysis of the audio stream to detect gaps between tracks.
- **Auto-Splitting**: Automatically creates new recording chunks when silence is detected.
- **Local MP3 Conversion**: Converts recorded tracks to high-quality MP3 (192k) using FFmpeg and a Python backend.
- **Sequential Naming**: Files are automatically saved to `recorded_tracks/` with unique timestamps.

## Prerequisites

- **Chrome Browser**: Supports Manifest V3 and the Offscreen API.
- **Python 3.x**: Required for the local processing server.
- **FFmpeg**: Must be installed and available in your system's PATH for audio conversion.

## Setup

### 1. Backend Setup

The project includes a PowerShell script to automate the Python environment setup:

```powershell
./setup_project.ps1
```

This will:
- Create a virtual environment (`venv`).
- Install necessary Python dependencies (`fastapi`, `uvicorn`, `pytest`, etc.).
- Check for FFmpeg installation.

### 2. Extension Build

Install Node dependencies and build the extension:

```bash
npm install
npm run build
```

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the project root directory (ensure it contains `manifest.json` and the built `background.js`, `offscreen.js`, etc.).

## Usage

1. **Start the Backend**:
   ```powershell
   ./venv/Scripts/python.exe backend/main.py
   ```
   The server will start at `http://localhost:5000`.

2. **Record Audio**:
   - Click the **RecordTabAudio** extension icon in your browser.
   - Click **Start Recording**. The extension will capture audio from the current tab.
   - The extension will automatically split tracks when it detects silence.
   - Tracks are sent to the backend and saved in the `recorded_tracks/` folder as MP3s.

## Development

### Running Tests

To run the backend tests:

```powershell
./run_tests.ps1
```

### Built-in Scripts

- `npm run build`: Compiles TypeScript files to JavaScript.
- `npm run watch`: Watches for changes and rebuilds automatically.

## License

This project is licensed under the ISC License.
