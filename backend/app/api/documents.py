from fastapi import HTTPException, APIRouter

from app.schemas.schemas import DocumentResponse, IndexRequest
from app.services import document_service, engine
from app.dependencies.db import DB

router = APIRouter(tags=['documents'])

@router.post('/index', response_model=DocumentResponse)
def index_file(payload: IndexRequest, db: DB):
    try:
        return document_service.process_index_file(payload.file_path, db)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get('/search')
def search_document(query: str, limit: int = 5):
    if not query:
        raise HTTPException(status_code=400, detail="Query is empty" )
    results = engine.search_documents(query, limit) 
    return results   
