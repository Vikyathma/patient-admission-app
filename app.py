import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.main import app as api_app

app = FastAPI()

# Mount all backend API routes under /api
app.mount("/api", api_app)

dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")

# Serve static assets (JS, CSS, icons)
if os.path.exists(os.path.join(dist_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

# Catch-all route to serve React's index.html
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join(dist_dir, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(dist_dir, "index.html"))