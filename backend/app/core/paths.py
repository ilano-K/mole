from pathlib import Path
import os 

APP_NAME = "mole"

LOCAL_APP_DATA = Path(os.getenv("LOCALAPPDATA")) / APP_NAME
ROAMING_APP_DATA = Path(os.getenv("APPDATA")) / APP_NAME

LOCAL_APP_DATA.mkdir(parents=True, exist_ok=True)
ROAMING_APP_DATA.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = LOCAL_APP_DATA / "app.db"
CHROMA_PATH = LOCAL_APP_DATA / "chroma"

CHROMA_PATH.mkdir(parents=True, exist_ok=True)