# Build script for RecordTabAudio Extension

Write-Host "--- Building Extension ---" -ForegroundColor Cyan

# Create dist directory if it doesn't exist
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist"
}

# Run esbuild
Write-Host "Compiling TypeScript..."
npx esbuild src/background.ts src/offscreen.ts --bundle --outdir=dist --target=chrome100
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Copy static assets to dist
Write-Host "Copying assets..."
Copy-Item "manifest.json" "dist/manifest.json" -Force
Copy-Item "offscreen.html" "dist/offscreen.html" -Force

Write-Host "--- Build Complete! ---" -ForegroundColor Green
Write-Host "You can now load the 'dist' folder as an unpacked extension in Chrome."
