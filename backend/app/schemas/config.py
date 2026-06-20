from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.enums.file_extension import FileExtensions

class AppConfigBase(BaseModel):
    target_directory: str 
    allowed_extensions: List[FileExtensions]
    include_subfolders: bool = True 
    
class AppConfigCreate(AppConfigBase):
    pass 

class AppConfigResponse(AppConfigBase):
    id: int 
    updated_at: Optional[datetime] = None 
    model_config = ConfigDict(from_attributes=True)
    