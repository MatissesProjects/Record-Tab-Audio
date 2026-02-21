let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let analyser: AnalyserNode | null = null;
let dataArray: Float32Array | null = null;
let silenceStart: number | null = null;
const SILENCE_THRESHOLD = 0.01; // 1% of max volume
const SILENCE_DURATION = 2500; // 2.5 seconds

chrome.runtime.onMessage.addListener(async (message: { type: string; streamId: string }) => {
  if (message.type === 'START_RECORDING') {
    startRecording(message.streamId);
  }
});

async function startRecording(streamId: string) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      } as any,
      video: false
    });

    // Route the audio to a new AudioContext destination so the tab doesn't mute itself.
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    
    // Step 2.1: Initialize AnalyserNode
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Float32Array(bufferLength);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Initialize MediaRecorder to start capturing the audio as audio/webm;codecs=opus.
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    
    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      
      // Step 3.4: Validation (End-to-End) - Upload to Backend
      try {
        const formData = new FormData();
        formData.append('file', blob, `track_${Date.now()}.webm`);
        
        console.log('Uploading track to backend...');
        const response = await fetch('http://localhost:5000/upload-track', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.status === 'success') {
          console.log('Successfully recorded and converted track:', result.file);
        } else {
          console.error('Backend failed to process track:', result.message);
          // Fallback to local download if backend fails
          downloadLocally(blob);
        }
      } catch (err) {
        console.error('Failed to connect to backend:', err);
        // Fallback to local download if connection fails
        downloadLocally(blob);
      }
      
      recordedChunks = [];
      // Don't close window here if we want to continue recording new tracks
    };

    mediaRecorder.start();
    console.log('Recording started...');

    // Step 2.2: The RMS Loop
    monitorAudio();

  } catch (err) {
    console.error('Failed to start recording in offscreen document:', err);
  }
}

function monitorAudio() {
  if (!analyser || !dataArray || (mediaRecorder && mediaRecorder.state !== 'recording')) return;

  analyser.getFloatTimeDomainData(dataArray);

  let sumSquares = 0.0;
  for (const amplitude of dataArray) {
    sumSquares += amplitude * amplitude;
  }
  const rms = Math.sqrt(sumSquares / dataArray.length);

  // Step 2.3: The Split Trigger
  if (rms < SILENCE_THRESHOLD) {
    if (silenceStart === null) {
      silenceStart = Date.now();
    } else if (Date.now() - silenceStart > SILENCE_DURATION) {
      console.log('Silence Detected! Triggering split...');
      silenceStart = null;
      splitRecording();
    }
  } else {
    silenceStart = null;
  }

  requestAnimationFrame(monitorAudio);
}

function splitRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    // Restart recording immediately
    setTimeout(() => {
      if (mediaRecorder) {
        mediaRecorder.start();
        console.log('Restarted recording for new track.');
      }
    }, 100); 
  }
}

function downloadLocally(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recording_${Date.now()}.webm`;
  a.click();
  window.URL.revokeObjectURL(url);
}
