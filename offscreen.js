let mediaRecorder;
let recordedChunks = [];

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'START_RECORDING') {
    startRecording(message.streamId);
  }
});

async function startRecording(streamId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    // Route the audio to a new AudioContext destination so the tab doesn't mute itself.
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    // Initialize MediaRecorder to start capturing the audio as audio/webm;codecs=opus.
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      window.URL.revokeObjectURL(url);
      recordedChunks = [];
      // Close the offscreen document after recording stops
      window.close();
    };

    mediaRecorder.start();
    console.log('Recording started...');

    // For Milestone 1 validation: Record for 10 seconds and stop.
    setTimeout(() => {
      mediaRecorder.stop();
      console.log('Recording stopped after 10 seconds.');
    }, 10000);

  } catch (err) {
    console.error('Failed to start recording in offscreen document:', err);
  }
}
