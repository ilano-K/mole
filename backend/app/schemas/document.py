from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime 

class DocumentBase(BaseModel):
    filename: str 
    file_path: str 
    
class DocumentCreate(DocumentBase):
    last_modified: Optional[float] = None 
    last_indexed: Optional[datetime] = None 
    
class ScanPendingFileResponse(BaseModel):
    files: List[str]

class SearchRequest(BaseModel):
    query: str
    n_results: int 

class SearchResponse(BaseModel):
    documents: list
    metadatas: list
    distances: list