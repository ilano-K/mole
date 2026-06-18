from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from datetime import datetime, timezone
import os

from app.schemas.schemas import AppConfigCreate, AppConfigResponse,DocumentCreate, DocumentResponse, IndexRequest
from app.database.crud import upsert_config, create_document, get_document_by_path
from app.dependencies.db import DB
from app.services import engine
from app.utils import parsers


app = FastAPI(title="mole")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows POST, GET, PUT, DELETE
    allow_headers=["*"], 
)

@app.post('/index', response_model=DocumentResponse)
def index_file(payload: IndexRequest, db: DB):
    file_path = payload.file_path 
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    try:
        # 1. Check when the file was last saved
        os_timestamp = os.path.getmtime(file_path)
        modified_time = datetime.fromtimestamp(os_timestamp, tz=timezone.utc)
        
        # 2. Check modified time from the database
        db_doc = get_document_by_path(db, file_path)
        
        # 3. Compare if the document needs to be re-indexed
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/search')
def search_document(query: str, limit: int = 5):
    if not query:
        raise HTTPException(status_code=400, detail="Query is empty" )
    
    results = engine.search_documents(query, limit) 
    return results   

## App config
@app.post('/set-config', response_model=AppConfigResponse)
def set_config(payload: AppConfigCreate, db: DB):
    dir_path = Path(payload.target_directory)
    
    if not dir_path.exists() or not dir_path.is_dir():
        raise HTTPException(status_code=404, detail="Directory does not exist or invalid")
    
    # save to database here
    config = upsert_config(db, payload)
    return config
    