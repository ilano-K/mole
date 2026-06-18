from app.enums.file_extension import FileExtensions
from pydantic import BaseModel 
from typing import List 

class WatchConfig(BaseModel):
    target_directory: str 
    allowed_extensions: List[FileExtensions]
    include_subfolders: bool = True 