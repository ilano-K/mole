from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime 
from app.schemas.document import DocumentBase

class IndexRequest(BaseModel):
    file_path: str

class IndexResponse(DocumentBase):
    id: int 
    last_modified: Optional[float] = None 
    last_indexed: Optional[datetime] = None 
    
    model_config = ConfigDict(from_attributes=True)

class BatchIndexRequest(BaseModel):
    file_paths: List[str]

class BatchIndexResponse(BaseModel):
    indexed: int
    errors: int 
    failed_files: List[str]