from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

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

@app.post('/index')
def index_file(file_path: str):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    doc_chunks = parsers.extract_text(file_path)
    engine.insert_chunks(file_path, doc_chunks)
    
    try:
        doc_chunks = parsers.extract_text(file_path)
        engine.insert_chunks(file_path, doc_chunks)
        return {
            "status": "success",
            "chunks_added": len(doc_chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/search')
def search_document(query: str, limit: int = 5):
    if not query:
        raise HTTPException(status_code=400, detail="Query is empty" )
    
    results = engine.search_documents(query, limit) 
    return results    