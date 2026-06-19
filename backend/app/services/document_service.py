from app.schemas.indexing import BatchIndexResponse
from app.schemas.config import AppConfigCreate
from app.schemas.document import DocumentCreate, ScanPendingFileResponse
from datetime import datetime, timezone 
from sqlalchemy.orm import Session
from app.database.crud import get_document_by_path, create_document, upsert_config, get_config
from app.utils import parsers
from app.services import engine
from app.core import exceptions
from pathlib import Path
import os 

def execute_indexing(file_path: str, db: Session):
    os_timestamp = os.path.getmtime(file_path)
    actual_modified_time = datetime.fromtimestamp(os_timestamp, tz=timezone.utc)
    
    doc_chunks = parsers.extract_text(file_path)
    engine.insert_chunks(file_path, doc_chunks)
    
    existing_doc = get_document_by_path(file_path)
    if existing_doc:
        existing_doc.last_modified = actual_modified_time
        db.commit()
        db.refresh(existing_doc)
        return existing_doc
    else:
        doc = DocumentCreate(
            filename=os.path.basename(file_path),
            file_path=file_path,
            last_modified=actual_modified_time
        )
        created_doc = create_document(db, doc)
        return created_doc
    
def check_needs_indexing(file_path: str, db: Session):
    if not os.path.exists(file_path):
        raise FileNotFoundError("File not found")
    
    os_timestamp = os.path.getmtime(file_path)
    actual_modified_time = datetime.fromtimestamp(os_timestamp, tz=timezone.utc)
    
    db_doc = get_document_by_path(db, file_path)
    
    if db_doc and db_doc.last_modified:
        db_time = db_doc.last_modified.replace(microsecond=0)
        hd_time = actual_modified_time.replace(microsecond=0)
        if db_time >= hd_time:
            return False
    return True

def process_index_file(file_path: str, db: Session):
    if check_needs_indexing(file_path, db):
        return execute_indexing(file_path, db)
    
    return get_document_by_path(db, file_path)

def process_index_batch(file_paths: list[str], db: Session):
    if len(file_paths) == 0:
        raise exceptions.EmptyFileListError
    
    config = get_config(db)
    
    # Config not yet configured
    if not config or not config.target_directory:
        raise exceptions.ConfigNotFoundError
    
    stats = {"indexed": 0, "errors": 0, "failed_files": []}
    
    for file_path in file_paths:
        try:
            process_index_file(file_path, db) 
            stats['indexed'] +=1
        except Exception:
            stats['errors'] +=1
            stats['failed_files'].append(file_path)
            continue
    return BatchIndexResponse(
        indexed=stats["indexed"],
        errors=stats["errors"],
        failed_files=stats["failed_files"]
    )

def process_scan_files(db: Session):
    config = get_config(db)
    if not config:
        raise exceptions.ConfigNotFoundError
    
    target_dir = Path(config.target_directory)
    if not target_dir.exists():
        raise exceptions.FileDirectoryNotFoundError
    
    pending_files = []
    
    for root, dirs, files in os.walk(target_dir):
        # if skip subfolder enabled
        if not config.include_subfolders and Path(root) != target_dir:
            continue 
        
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            if ext not in config.allowed_extensions:
                continue 
            
            if check_needs_indexing(file_path, db):
                pending_files.append(file_path)
    return ScanPendingFileResponse(
        pending_count=len(pending_files),
        files=pending_files
    )

def save_config(payload: AppConfigCreate, db: Session):
    dir_path = Path(payload.target_directory)
    
    if not dir_path.exists():
        raise FileNotFoundError
    
    return upsert_config(db, payload)