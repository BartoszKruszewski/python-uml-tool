from pathlib import Path


class Config:
    root = Path(__file__).parents[2]
    src = root / "src"
    host = "localhost"
    port = 8080
    static_path = src / "static"
    templates_path = src / "templates"
