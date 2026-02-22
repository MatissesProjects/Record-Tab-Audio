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
