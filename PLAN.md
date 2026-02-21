Project Plan: Tab Audio Capture & Auto-Splitter
1. Architecture Overview
The Background (Service Worker): Listens for your click on the extension icon. It asks Chrome for permission to capture the active tab and generates a secure streamId.

The Offscreen Document (The Recorder): An invisible HTML/JS page spawned by the background script. It takes the streamId, records the audio to a WebM format, and actively monitors the waveform for silence to detect track changes.

The Python Backend (The Processor): A local Flask/FastAPI server that receives the WebM chunks from the offscreen document and uses ffmpeg to convert them into high-quality .mp3 files.

2. Phase 1: The Chrome Extension (Frontend)
Step 1.1: manifest.json Setup

Request permissions: tabCapture, offscreen.

Define the background service worker (background.js).

Step 1.2: The Background Coordinator (background.js)

Listen for chrome.action.onClicked.

Call chrome.tabCapture.getMediaStreamId() to get the capture token.

Call chrome.offscreen.createDocument() to spawn offscreen.html.

Send the streamId to the offscreen document via Chrome messaging.

Step 1.3: The Offscreen Recorder (offscreen.html & offscreen.js)

Receive the streamId and call navigator.mediaDevices.getUserMedia() to tap into the audio.

Crucial Step: Route the audio to a new AudioContext destination so the tab doesn't mute itself while you're listening.

Initialize MediaRecorder to start capturing the audio as audio/webm;codecs=opus.

3. Phase 2: Silence Detection & Auto-Splitting (The "Next Song" Feature)
Step 2.1: Initialize AnalyserNode

Inside offscreen.js, connect the audio stream to a Web Audio API AnalyserNode.

Step 2.2: The RMS Loop

Use requestAnimationFrame to constantly poll the frequency data.

Calculate the Root Mean Square (RMS) volume level (a measure of loudness).

Step 2.3: The Split Trigger

If the RMS drops below a specific threshold (e.g., 1% of max volume) for a sustained duration (e.g., 2.5 seconds), trigger a split.

Command the MediaRecorder to stop the current track, package the Blob, and immediately start recording a new one.

4. Phase 3: The Python Backend & MP3 Conversion
Step 3.1: Python Server Setup

Spin up a local server on port 5000.

Create a POST /upload-track endpoint that accepts the raw WebM blobs from the extension.

Step 3.2: FFmpeg Conversion

Browsers cannot natively encode MP3s efficiently, which is why we record in WebM.

Python takes the WebM file and runs it through ffmpeg:

Bash
ffmpeg -i input_track.webm -vn -ab 192k -ar 44100 -y output_track.mp3
Step 3.3: Output Management

Auto-name the files with a timestamp or sequential numbering (e.g., track_01.mp3, track_02.mp3).

Save them directly to the designated asset folder for your sequencer.

5. Implementation Roadmap
First Milestone: Get the extension to successfully record 10 seconds of audio and download it locally as a WebM file. (Validates permissions and the Offscreen API).

Second Milestone: Implement the AnalyserNode and get the console to accurately print "Silence Detected!" between songs.

Third Milestone: Spin up Python, send the files over HTTP, and successfully convert them to MP3.