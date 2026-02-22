import pytest
from fastapi.testclient import TestClient
from backend.main import app
import os

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "RecordTabAudio Backend is running!"}

def test_upload_track_no_file():
    response = client.post("/upload-track")
    assert response.status_code == 422 # Validation error for missing file

def test_upload_mock_webm():
    # Create a small dummy webm file for testing
    test_file_path = "test_audio.webm"
    with open(test_file_path, "wb") as f:
        f.write(b"dummy webm content")
    
    try:
        with open(test_file_path, "rb") as f:
            response = client.post(
                "/upload-track",
                files={"file": ("test_audio.webm", f, "audio/webm")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        
        # Verify the .webm file was deleted (if status is success)
        if data["status"] == "success":
            filename = data["file"].replace(".mp3", ".webm")
            webm_path = os.path.join("recorded_tracks", filename)
            assert not os.path.exists(webm_path), f"File {webm_path} should have been deleted"
        
    finally:
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_upload_invalid_file_cleanup():
    # Create an invalid file that might cause ffmpeg to fail or just be a non-audio file
    test_file_path = "invalid.webm"
    with open(test_file_path, "wb") as f:
        f.write(b"not a real webm")
    
    try:
        response = client.post(
            "/upload-track",
            files={"file": ("invalid.webm", open(test_file_path, "rb"), "audio/webm")}
        )
        
        # Even if it fails (e.g. status: error from ffmpeg), the webm should be gone
        # We need to find the timestamp-based filename. Since we can't easily, 
        # we check the directory for any webm files.
        webms = [f for f in os.listdir("recorded_tracks") if f.endswith(".webm")]
        assert len(webms) == 0, f"Expected 0 .webm files, found {len(webms)}: {webms}"
        
    finally:
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
