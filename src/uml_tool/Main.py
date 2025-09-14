# from project_generator.Main import Main
import uvicorn
from fastapi import FastAPI
from fastapi.requests import Request

from uml_tool.Config import Config

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/generate")
async def generate(request: Request):
    # Main()
    pass


def main():
    uvicorn.run(app, host=Config.host, port=Config.port)
