from fastapi import APIRouter
from app.schemas.document import (
    ScanPendingFileResponse, 
    SearchRequest, 
    SearchResponse
)
from app.schemas.indexing import (
    IndexRequest, IndexResponse, 
    BatchIndexRequest, BatchIndexResponse
)
from app.services import document_service
from app.dependencies.db import DB

router = APIRouter(prefix="/documents",tags=['documents'])

@router.post('/index', response_model=IndexResponse)
def index_file(payload: IndexRequest, db: DB):
    return document_service.process_index_file(payload.file_path, db)

@router.post('/index-batch', response_model=BatchIndexResponse)
def index_batch(payload: BatchIndexRequest, db: DB):
    return document_service.process_index_batch(payload.file_paths, db)

@router.get('/scan-pending', response_model=ScanPendingFileResponse)
def scan_pending_files(db: DB):
    return document_service.scan_pending_files(db)

@router.post('/search', response_model=SearchResponse)
def search_document(payload: SearchRequest):
    return document_service.search_documents(
        payload.query, payload.n_results, 
        payload.unique_results
    )
