from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime 

class DocumentBase(BaseModel):
    filename: str 
    file_path: str 
    
class DocumentCreate(DocumentBase):
    last_modified: Optional[float] = None 
    last_indexed: Optional[datetime] = None 

class DocumentResponse(DocumentBase):
    id: int 
    last_modified: Optional[float] = None 
    last_indexed: Optional[datetime] = None 
    
    model_config = ConfigDict(from_attributes=True)
    
class ScanPendingFileResponse(BaseModel):
    files: List[str]