# Product Definition: Tab Audio Capture & Auto-Splitter

## Overview
A tool that captures audio from a Chrome tab and automatically splits it into separate tracks based on silence detection. The resulting tracks are then converted to high-quality MP3 files using a local Python backend.

## Core Features
- **Tab Audio Capture**: Uses the Chrome Offscreen API to capture tab audio without muting it.
- **Silence Detection**: Real-time analysis of the audio stream (RMS) to detect gaps between tracks.
- **Auto-Splitting**: Automatically creates new recording chunks when silence is detected.
- **MP3 Conversion**: Local Python server (Flask/FastAPI) and FFmpeg for high-quality MP3 encoding.
- **Sequential Naming**: Files are automatically named (e.g., track_01.mp3).

## Target User
Users who want to record audio from browser tabs (e.g., music, podcasts) and have it automatically segmented into individual files ready for use in sequencers or other media tools.
