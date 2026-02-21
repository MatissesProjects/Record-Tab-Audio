from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import subprocess
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you'd specify your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "recorded_tracks"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.get("/")
def read_root():
    return {"message": "RecordTabAudio Backend is running!"}

@app.post("/upload-track")
async def upload_track(file: UploadFile = File(...)):
    timestamp = int(time.time())
    webm_filename = f"track_{timestamp}.webm"
    mp3_filename = f"track_{timestamp}.mp3"
    
    webm_path = os.path.join(UPLOAD_DIR, webm_filename)
    mp3_path = os.path.join(UPLOAD_DIR, mp3_filename)

    with open(webm_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Step 3.2: FFmpeg Conversion
    try:
        # ffmpeg -i input_track.webm -vn -ab 192k -ar 44100 -y output_track.mp3
        subprocess.run([
            "ffmpeg", "-i", webm_path, "-vn", "-ab", "192k", "-ar", "44100", "-y", mp3_path
        ], check=True)
        return {"status": "success", "file": mp3_filename}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"FFmpeg failed: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
