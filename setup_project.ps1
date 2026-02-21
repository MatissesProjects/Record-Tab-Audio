# Setup Project for RecordTabAudio

Write-Host "--- Setting up Python Backend ---" -ForegroundColor Cyan

# Check if venv exists but might be broken (e.g. no Scripts folder)
if (Test-Path "venv") {
    if (-not (Test-Path "venv\Scripts\python.exe")) {
        Write-Host "Partial or broken virtual environment detected. Removing and recreating..." -ForegroundColor Yellow
        Remove-Item -Path "venv" -Recurse -Force
    }
}

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create venv with 'python'. Trying 'py'..." -ForegroundColor Yellow
        py -m venv venv
    }
} else {
    Write-Host "Virtual environment already exists."
}

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "CRITICAL: Could not create virtual environment. Please ensure Python 3 is installed and in your PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Installing/Updating dependencies..."
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r backend/requirements.txt

Write-Host "`n--- Checking for FFmpeg ---" -ForegroundColor Cyan
$ffmpegFound = $false
try {
    $ffmpegVer = ffmpeg -version
    if ($ffmpegVer) {
        Write-Host ($ffmpegVer[0]) -ForegroundColor Green
        $ffmpegFound = $true
    }
} catch {
    # Handled below
}

if (-not $ffmpegFound) {
    Write-Host "FFmpeg NOT found! Please install it and add it to your PATH for the backend to work." -ForegroundColor Red
}

Write-Host "`n--- Setup Complete ---" -ForegroundColor Green
Write-Host "To run the backend: .\venv\Scripts\python.exe backend\main.py"
Write-Host "To run tests: .\venv\Scripts\python.exe -m pytest backend/tests"
