from pathlib import Path


def safe_unlink(path: Path):
    """Helpers to safely delete a file.

    Args:
        path: Path to the file to delete.
    """
    try:
        path.unlink(missing_ok=True)
    except FileNotFoundError:
        pass
    except Exception:
        pass
