enum RecordingState {
  IDLE = 'IDLE',
  WAITING_FOR_AUDIO = 'WAITING_FOR_AUDIO',
  RECORDING = 'RECORDING'
}

let currentState: RecordingState = RecordingState.IDLE;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let analyser: AnalyserNode | null = null;
let dataArray: Float32Array | null = null;
let silenceStart: number | null = null;
let audioStream: MediaStream | null = null;

let silenceThreshold = 0.01;
let silenceDuration = 2500;
let isAutoRecordMode = false;

chrome.runtime.onMessage.addListener(async (message: { type: string; streamId: string; settings: any }) => {
  if (message.type === 'START_RECORDING') {
    updateSettings(message.settings);
    isAutoRecordMode = !!message.settings?.autoRecord;
    
    if (!audioStream) {
      await startCapture(message.streamId);
    }

    if (isAutoRecordMode) {
      setRecordingState(RecordingState.WAITING_FOR_AUDIO);
    } else {
      startMediaRecorder();
    }
  } else if (message.type === 'STOP_RECORDING') {
    stopMediaRecorder();
    setRecordingState(RecordingState.IDLE);
    // Wait for final upload then close
    setTimeout(() => window.close(), 2000);
  }
});

function updateSettings(settings: any) {
  if (settings) {
    silenceThreshold = settings.threshold || silenceThreshold;
    silenceDuration = settings.duration || silenceDuration;
  }
}

async function startCapture(streamId: string) {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      } as any,
      video: false
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Float32Array(analyser.frequencyBinCount);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    monitorAudio();
    console.log('Audio capture started, monitoring...');
  } catch (err) {
    console.error('Failed to start audio capture:', err);
  }
}

function startMediaRecorder() {
  if (!audioStream || currentState === RecordingState.RECORDING) return;

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm;codecs=opus' });
  
  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data.size > 0) recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = handleRecorderStop;

  mediaRecorder.start();
  setRecordingState(RecordingState.RECORDING);
  console.log('MediaRecorder started');
}

function stopMediaRecorder() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
}

async function handleRecorderStop() {
  if (recordedChunks.length === 0) return;
  
  const blob = new Blob(recordedChunks, { type: 'audio/webm' });
  recordedChunks = [];

  try {
    const formData = new FormData();
    formData.append('file', blob, `track_${Date.now()}.webm`);
    
    console.log('Uploading to backend...');
    const response = await fetch('http://localhost:5000/upload-track', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.status !== 'success') {
      downloadLocally(blob);
    }
  } catch (err) {
    console.error('Upload failed:', err);
    downloadLocally(blob);
  }
}

function monitorAudio() {
  if (!analyser || !dataArray) return;

  analyser.getFloatTimeDomainData(dataArray);

  let sumSquares = 0.0;
  for (const amplitude of dataArray) {
    sumSquares += amplitude * amplitude;
  }
  const rms = Math.sqrt(sumSquares / dataArray.length);

  if (currentState === RecordingState.WAITING_FOR_AUDIO) {
    if (rms > silenceThreshold) {
      console.log('Audio detected! Starting recording...');
      startMediaRecorder();
    }
  } else if (currentState === RecordingState.RECORDING) {
    if (rms < silenceThreshold) {
      if (silenceStart === null) {
        silenceStart = Date.now();
      } else if (Date.now() - silenceStart > silenceDuration) {
        console.log('Silence detected! Splitting...');
        silenceStart = null;
        splitRecording();
      }
    } else {
      silenceStart = null;
    }
  }

  requestAnimationFrame(monitorAudio);
}

function splitRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    // In auto-record mode, we go back to WAITING or just start immediately if there is still audio
    // But usually, splitting means one song ended. 
    // If there is still audio, we should probably start a new one immediately.
    setTimeout(() => {
        if (isAutoRecordMode) {
            // Check if we should wait for audio again or start immediately
            // For now, let's go back to WAITING to be safe
            setRecordingState(RecordingState.WAITING_FOR_AUDIO);
        } else {
            startMediaRecorder();
        }
    }, 100);
  }
}

function setRecordingState(state: RecordingState) {
  currentState = state;
  chrome.runtime.sendMessage({ type: 'STATUS_UPDATE', state: currentState, isRecording: state === RecordingState.RECORDING });
}

function downloadLocally(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recording_${Date.now()}.webm`;
  a.click();
  window.URL.revokeObjectURL(url);
}
