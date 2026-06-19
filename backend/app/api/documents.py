from fastapi import HTTPException, APIRouter

from app.schemas.document import DocumentResponse, ScanPendingFileResponse
from app.schemas.indexing import IndexRequest, BatchIndexRequest, BatchIndexResponse
from app.services import document_service, engine
from app.dependencies.db import DB
from app.core import exceptions

router = APIRouter(tags=['documents'])

@router.post('/index', response_model=DocumentResponse)
def index_file(payload: IndexRequest, db: DB):
    try:
        return document_service.process_index_file(payload.file_path, db)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found error")

@router.post('/index-batch', response_model=BatchIndexResponse)
def index_batch(payload: BatchIndexRequest, db: DB):
    try:
        return document_service.process_index_batch(payload.file_paths, db)
    except exceptions.EmptyFileListError:
        raise HTTPException(status_code=400, detail="No files provided")
    except exceptions.ConfigNotFoundError:
        raise HTTPException(status_code=404, detail="Config not found")

@router.get('/scan-pending', response_model=ScanPendingFileResponse)
def scan_pending_files(db: DB):
    try: 
        return document_service.process_scan_files(db)
    except exceptions.ConfigNotFoundError:
        raise HTTPException(status_code=404, detail="Config not found")
    except exceptions.FileDirectoryNotFoundError:
        raise HTTPException(status_code=404, detail="Directory not found")

@router.get('/search')
def search_document(query: str, limit: int = 5):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query is empty" )
    results = engine.search_documents(query, limit) 
    return results   
