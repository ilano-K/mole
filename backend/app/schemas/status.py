from pydantic import BaseModel
from typing import List

class DashboardStatusResponse(BaseModel):
    needs_rebuild: bool
    pending_files_count: int
    pending_files: List[str]
    target_directory: str