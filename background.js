chrome.action.onClicked.addListener(async (tab) => {
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id
    });
    
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Capturing tab audio for recording.'
    });
    
    chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      streamId: streamId
    });
    
    console.log('Recording initiated for tab:', tab.id);
  } catch (err) {
    console.error('Failed to initiate recording:', err);
  }
});
