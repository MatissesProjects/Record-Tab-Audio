const recordBtn = document.getElementById('record-btn') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const backendStatus = document.getElementById('backend-status') as HTMLDivElement;
const thresholdInput = document.getElementById('threshold') as HTMLInputElement;
const durationInput = document.getElementById('duration') as HTMLInputElement;
const autoRecordToggle = document.getElementById('auto-record') as HTMLInputElement;

let isRecording = false;

// Load settings
chrome.storage.local.get(['silenceThreshold', 'silenceDuration', 'autoRecordEnabled'], (result) => {
    if (result.silenceThreshold) thresholdInput.value = result.silenceThreshold;
    if (result.silenceDuration) durationInput.value = result.silenceDuration;
    if (result.autoRecordEnabled !== undefined) autoRecordToggle.checked = result.autoRecordEnabled;
});

// Check recording status on popup open
chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response && response.isRecording) {
        updateUI(true);
    }
});

// Check backend status
async function checkBackend() {
    try {
        const response = await fetch('http://localhost:5000/');
        if (response.ok) {
            backendStatus.textContent = 'Backend: Online';
            backendStatus.className = 'backend-online';
        } else {
            throw new Error();
        }
    } catch {
        backendStatus.textContent = 'Backend: Offline';
        backendStatus.className = 'backend-offline';
    }
}

checkBackend();

recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        // Start Recording manually
        const threshold = parseFloat(thresholdInput.value);
        const duration = parseInt(durationInput.value);

        // Save settings
        chrome.storage.local.set({ 
            silenceThreshold: threshold, 
            silenceDuration: duration 
        });

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            chrome.runtime.sendMessage({ 
                type: 'START_RECORD_FROM_POPUP', 
                tabId: tab.id,
                settings: { threshold, duration }
            });
            updateUI(true);
        }
    } else {
        // Stop Recording manually
        chrome.runtime.sendMessage({ type: 'STOP_RECORD_FROM_POPUP' });
        updateUI(false);
    }
});

autoRecordToggle.addEventListener('change', async () => {
    const enabled = autoRecordToggle.checked;
    chrome.storage.local.set({ autoRecordEnabled: enabled });
    
    if (enabled) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            chrome.runtime.sendMessage({ 
                type: 'ENABLE_AUTO_RECORD', 
                tabId: tab.id,
                settings: { 
                    threshold: parseFloat(thresholdInput.value), 
                    duration: parseInt(durationInput.value) 
                }
            });
        }
    } else {
        chrome.runtime.sendMessage({ type: 'DISABLE_AUTO_RECORD' });
    }
});

function updateUI(recording: boolean, state: string = 'IDLE') {
    isRecording = recording;
    if (recording) {
        recordBtn.textContent = 'Stop Recording';
        recordBtn.className = 'recording';
        statusText.textContent = 'Status: Recording...';
        statusDot.className = 'recording';
    } else if (state === 'WAITING_FOR_AUDIO') {
        recordBtn.textContent = 'Stop Monitoring';
        recordBtn.className = 'recording';
        statusText.textContent = 'Status: Waiting for audio...';
        statusDot.className = 'idle'; // Maybe an orange dot later?
    } else {
        recordBtn.textContent = 'Start Recording';
        recordBtn.className = '';
        statusText.textContent = 'Status: Idle';
        statusDot.className = 'idle';
    }
}

// Listen for status updates from background
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'STATUS_UPDATE') {
        updateUI(message.isRecording, message.state);
    }
});
