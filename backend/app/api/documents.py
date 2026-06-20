from fastapi import HTTPException, APIRouter

from app.schemas.document import DocumentResponse, ScanPendingFileResponse
from app.schemas.indexing import IndexRequest, BatchIndexRequest, BatchIndexResponse
from app.services import document_service, engine
from app.dependencies.db import DB

router = APIRouter(tags=['documents'])

@router.post('/index', response_model=DocumentResponse)
def index_file(payload: IndexRequest, db: DB):
    return document_service.process_index_file(payload.file_path, db)

@router.post('/index-batch', response_model=BatchIndexResponse)
def index_batch(payload: BatchIndexRequest, db: DB):
    return document_service.process_index_batch(payload.file_paths, db)

@router.get('/scan-pending', response_model=ScanPendingFileResponse)
def scan_pending_files(db: DB):
    return document_service.process_scan_files(db)

@router.get('/search')
def search_document(query: str, limit: int = 5):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query is empty" )
    results = engine.search_documents(query, limit) 
    return results   
