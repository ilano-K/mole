from app.enums.file_extension import FileExtensions
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class AppConfigBase(BaseModel):
    target_directory: str 
    allowed_extensions: List[FileExtensions]
    include_subfolders: bool = True 
    
class AppConfigCreate(AppConfigBase):
    pass 

class AppConfigResponse(AppConfigBase):
    id: int 
    updated_at = Optional[datetime] = None 
    model_config = ConfigDict(from_attributes=True)
    
class DocumentBase():
    file_name: str 
    file_path: str 
    
class DocumentCreate(DocumentBase):
    last_modified: Optional[datetime] = None 
    last_indexed: Optional[datetime] = None 

class DocumentResponse(DocumentBase):
    id: int 
    last_modified: Optional[datetime] = None 
    last_indexed: Optional[datetime] = None 
    
    model_config = ConfigDict(from_attributes=True)