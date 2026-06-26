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
    n_results: int = 10
    unique_results: bool = True

class SearchResult(DocumentBase):
    excerpt: str 
    distance: float 
    
class SearchResponse(BaseModel):
    results: list[SearchResult]