from pathlib import Path


def safe_unlink(path: Path):
    try:
        path.unlink(missing_ok=True)
    except FileNotFoundError:
        pass
    except Exception:
        pass
