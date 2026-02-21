const recordBtn = document.getElementById('record-btn') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const backendStatus = document.getElementById('backend-status') as HTMLDivElement;
const thresholdInput = document.getElementById('threshold') as HTMLInputElement;
const durationInput = document.getElementById('duration') as HTMLInputElement;

let isRecording = false;

// Load settings
chrome.storage.local.get(['silenceThreshold', 'silenceDuration'], (result) => {
    if (result.silenceThreshold) thresholdInput.value = result.silenceThreshold;
    if (result.silenceDuration) durationInput.value = result.silenceDuration;
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
        // Start Recording
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
        // Stop Recording
        chrome.runtime.sendMessage({ type: 'STOP_RECORD_FROM_POPUP' });
        updateUI(false);
    }
});

function updateUI(recording: boolean) {
    isRecording = recording;
    if (recording) {
        recordBtn.textContent = 'Stop Recording';
        recordBtn.className = 'recording';
        statusText.textContent = 'Status: Recording...';
        statusDot.className = 'recording';
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
        updateUI(message.isRecording);
    }
});
