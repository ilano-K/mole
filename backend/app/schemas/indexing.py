from pydantic import BaseModel
from typing import List 

class IndexRequest(BaseModel):
    file_path: str

class BatchIndexRequest(BaseModel):
    file_paths: List[str]

class BatchIndexResponse(BaseModel):
    indexed: int
    errors: int 
    failed_files: List[str]