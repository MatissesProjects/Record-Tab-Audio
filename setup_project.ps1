# Setup Project for RecordTabAudio

Write-Host "--- Setting up Python Backend ---" -ForegroundColor Cyan
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists."
} else {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Installing dependencies..."
.\venv\Scripts\python.exe -m pip install -r backend/requirements.txt

Write-Host "`n--- Checking for FFmpeg ---" -ForegroundColor Cyan
try {
    ffmpeg -version | Select-Object -First 1
    Write-Host "FFmpeg found and ready." -ForegroundColor Green
} catch {
    Write-Host "FFmpeg NOT found! Please install it for the backend to work." -ForegroundColor Red
}

Write-Host "`n--- Setup Complete ---" -ForegroundColor Green
Write-Host "To run the backend: .\venv\Scripts\python.exe backend\main.py"
Write-Host "To run tests: .\venv\Scripts\python.exe -m pytest backend/tests"
