let isRecording = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ isRecording });
  } else if (message.type === 'START_RECORD_FROM_POPUP') {
    startRecording(message.tabId, message.settings);
  } else if (message.type === 'STOP_RECORD_FROM_POPUP') {
    stopRecording();
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
    
    isRecording = true;
    console.log('Recording initiated for tab:', tabId);
    
    // Notify popup if it's open
    chrome.runtime.sendMessage({ type: 'STATUS_UPDATE', isRecording: true });
  } catch (err) {
    console.error('Failed to initiate recording:', err);
  }
}

async function stopRecording() {
  chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
  isRecording = false;
  
  // Close offscreen document if needed (handled in offscreen.js onstop)
  // Notify popup if it's open
  chrome.runtime.sendMessage({ type: 'STATUS_UPDATE', isRecording: false });
}

// Still listen for the icon click as a shortcut
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (!tab.id) return;
  if (!isRecording) {
    startRecording(tab.id, { threshold: 0.01, duration: 2500 });
  } else {
    stopRecording();
  }
});
