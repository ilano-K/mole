from app.schemas.document import (
    DocumentCreate, ScanPendingFileResponse, 
    SearchResponse, SearchResult
)
from app.schemas.indexing import BatchIndexResponse, ResetIndexResponse
from sqlalchemy.orm import Session
from app.core import exceptions
from app.services import chroma_service
from app.services.config_service import get_config
from app.utils import parsers
from pathlib import Path
import os 
from app.database.models import Document

from app.database import crud


def reset_index(db: Session):
    config = get_config(db)
    # reset chromadb
    chroma_service.recreate_collection(config)
    
    # reset documents table
    db.query(Document).delete()
    db.commit()
    
    config = get_config(db)
    config.needs_rebuild = False
    db.commit()
    db.refresh(config)

    return ResetIndexResponse(
        success=True,
        message="Index reset successfully"
    )
    
def execute_indexing(file_path: str, db: Session):
    modified_timestamp = os.path.getmtime(file_path)

    doc_chunks = parsers.extract_text(file_path)
    
    config = get_config(db)
    chroma_service.insert_chunks(file_path, doc_chunks, config)

    existing_doc = crud.get_document_by_path(db, file_path)

    if existing_doc:
        existing_doc.last_modified = modified_timestamp
        db.commit()
        db.refresh(existing_doc)
        return existing_doc

    doc = DocumentCreate(
        filename=os.path.basename(file_path),
        file_path=file_path,
        last_modified=modified_timestamp
    )

    return crud.create_document(db, doc)
    
def check_needs_indexing(file_path: str, db: Session):
    if not os.path.exists(file_path):
        raise exceptions.DocumentFileNotFoundError()

    file_timestamp = os.path.getmtime(file_path)

    db_doc = crud.get_document_by_path(db, file_path)

    if db_doc and db_doc.last_modified is not None:
        if db_doc.last_modified >= file_timestamp:
            return False

    return True

def process_index_file(file_path: str, db: Session):
    if check_needs_indexing(file_path, db):
        return execute_indexing(file_path, db)
    
    return crud.get_document_by_path(db, file_path)

def process_index_batch(file_paths: list[str], db: Session):
    if len(file_paths) == 0:
        raise exceptions.EmptyFileListError()
    
    config = get_config(db)
    
    # Config not yet configured
    if not config or not config.target_directory:
        raise exceptions.ConfigNotFoundError()
    
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



def scan_pending_files(db: Session):
    config = get_config(db)
    if not config:
        raise exceptions.ConfigNotFoundError()
    
    target_dir = Path(config.target_directory)
    if not target_dir.exists():
        raise exceptions.FileDirectoryNotFoundError()
    
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
        files=pending_files
    )

def search_documents(query: str, db: Session, n_results: int = 5, unique_results: bool = False):
    config = get_config(db)
    raw = chroma_service.search_documents(query, config, n_results)
    
    seen = set()
    results = []
    
    for doc, meta, dist in zip(
        raw["documents"],
        raw["metadatas"],
        raw["distances"]
    ):
        file_path = meta['file_path']
        
        if unique_results and file_path in seen:
            continue 
        seen.add(file_path)
        
        results.append(
            SearchResult(
                filename=os.path.basename(meta['file_path']),
                file_path=file_path,
                excerpt=doc[:250],
                distance=dist,
            )
        )
    
    return SearchResponse(results=results)
    

