import os
import shutil
import tempfile
import traceback
from pathlib import Path

import uvicorn
from fastapi import (
    FastAPI,
    File,
    UploadFile
)
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from fastapi.responses import (
    FileResponse,
    HTMLResponse
)
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from project_generator.exceptions import CustomException
from project_generator.main import generate_project
from starlette.background import BackgroundTask

from uml_tool.Config import Config
from uml_tool.utils import safe_unlink

app = FastAPI()
app.mount("/static", StaticFiles(directory=Config.static_path))
templates = Jinja2Templates(directory=Config.templates_path)


@app.get("/")
async def root(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request=request, name="index.html", context={})


@app.post("/generate")
def generate(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".xmi"):
        raise HTTPException(status_code=400, detail="Expected .xmi file!")

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir_path = Path(temp_dir)
        xmi_path = temp_dir_path / "input.xmi"
        output_dir = temp_dir_path / "output"
        output_dir.mkdir(exist_ok=True, parents=True)

        try:
            with open(xmi_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
        except Exception:
            raise HTTPException(
                status_code=400, detail="File upload failed")

        try:
            generate_project(xmi_path, output_dir)
        except CustomException:
            traceback.print_exc()
            raise HTTPException(
                status_code=400, detail="Not compatible XMI format")
        except Exception:
            raise HTTPException(
                status_code=500, detail="Unexpected project generation failed")

        try:
            zip_path = Path(shutil.make_archive(
                str(temp_dir_path / "project"), "zip", root_dir=str(output_dir)))
        except Exception:
            raise HTTPException(
                status_code=500, detail="Zip creation failed")

        fd, final_zip = tempfile.mkstemp(suffix=".zip")
        final_zip_path = Path(final_zip)
        os.close(fd)
        try:
            shutil.copyfile(zip_path, final_zip_path)
        except Exception:
            safe_unlink(final_zip_path)
            raise HTTPException(
                status_code=500, detail="Internal server error")

    return FileResponse(
        final_zip,
        media_type="application/zip",
        filename="project.zip",
        background=BackgroundTask(safe_unlink, final_zip_path)
    )


def main():
    uvicorn.run(app, host=Config.host, port=Config.port)
