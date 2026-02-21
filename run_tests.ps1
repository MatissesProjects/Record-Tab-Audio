# Run All Tests for RecordTabAudio

Write-Host "--- Testing Backend ---" -ForegroundColor Cyan
if (Test-Path "venv") {
    .\venv\Scripts\python.exe -m pytest backend/tests
} else {
    Write-Host "Virtual environment not found. Please run setup_project.ps1 first." -ForegroundColor Yellow
}

Write-Host "`n--- Validating Extension Structure ---" -ForegroundColor Cyan
$requiredFiles = @("manifest.json", "background.js", "offscreen.html", "offscreen.js")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "[OK] $file exists." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] $file is missing!" -ForegroundColor Red
    }
}
