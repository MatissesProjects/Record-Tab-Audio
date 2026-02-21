let isRecording = false;
let currentRecordingState = 'IDLE';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ isRecording, state: currentRecordingState });
  } else if (message.type === 'START_RECORD_FROM_POPUP') {
    startRecording(message.tabId, { ...message.settings, autoRecord: false });
  } else if (message.type === 'STOP_RECORD_FROM_POPUP') {
    stopRecording();
  } else if (message.type === 'ENABLE_AUTO_RECORD') {
    startRecording(message.tabId, { ...message.settings, autoRecord: true });
  } else if (message.type === 'DISABLE_AUTO_RECORD') {
    stopRecording();
  } else if (message.type === 'STATUS_UPDATE') {
    isRecording = message.isRecording;
    currentRecordingState = message.state;
    // Notify popup if it's open
    chrome.runtime.sendMessage(message);
  }
});

async function startRecording(tabId: number, settings: any) {
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    });
    
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: 'Capturing tab audio for recording.'
    });
    
    chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      streamId: streamId,
      settings: settings
    });
    
    console.log('Recording initiated for tab:', tabId, 'settings:', settings);
  } catch (err) {
    console.error('Failed to initiate recording:', err);
  }
}

async function stopRecording() {
  chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
  isRecording = false;
  currentRecordingState = 'IDLE';
}

// Still listen for the icon click as a shortcut
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (!tab.id) return;
  if (!isRecording) {
    startRecording(tab.id, { threshold: 0.01, duration: 2500, autoRecord: false });
  } else {
    stopRecording();
  }
});
