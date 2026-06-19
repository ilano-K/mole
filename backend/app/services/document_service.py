from app.schemas.schemas import AppConfigCreate, DocumentCreate
from datetime import datetime, timezone 
from sqlalchemy.orm import Session
from app.database.crud import get_document_by_path, create_document, upsert_config
from app.utils import parsers
from app.services import engine
from pathlib import Path
import os 


def process_index_file(file_path: str, db: Session):
    if not os.path.exists(file_path):
        raise FileNotFoundError("File not found")
    
    os_timestamp = os.path.getmtime(file_path)
    modified_time = datetime.fromtimestamp(os_timestamp, tz=timezone.utc)
    
    db_doc = get_document_by_path(db, file_path)
    
    if db_doc and db_doc.last_modified:
        db_time = db_doc.last_modified.replace(microsecond=0)
        hd_time = modified_time.replace(microsecond=0)
        if db_time >= hd_time:
            return db_doc
    
    doc_chunks = parsers.extract_text(file_path)
    engine.insert_chunks(file_path, doc_chunks)
    
    doc = DocumentCreate(
        filename=os.path.basename(file_path),
        file_path=file_path,
        last_modified=datetime.now(timezone.utc)
    )
    
    created_doc = create_document(db, doc)
    return created_doc
    
def save_config(payload: AppConfigCreate, db: Session):
    dir_path = Path(payload.target_directory)
    
    if not dir_path.exists():
        raise FileNotFoundError
    
    return upsert_config(db, payload)