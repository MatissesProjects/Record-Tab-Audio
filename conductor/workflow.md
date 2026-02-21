# Workflow: Tab Audio Capture & Auto-Splitter

## General Rules
- All new features must be implemented in the corresponding track's plan.
- Each milestone must be verified before proceeding to the next one.
- The Python backend and the Chrome extension should be developed in separate tracks but tested together once each is functional.
- Code should follow modern standards (manifest V3, clean Python code).
- Changes to the extension must be manually loaded into Chrome (via "Load unpacked").
- The Python server should be testable via curl or similar tools before integrating with the extension.

## Verification
- First Milestone: Record 10 seconds and download WebM.
- Second Milestone: "Silence Detected!" printed to console.
- Third Milestone: Successful conversion to MP3.
