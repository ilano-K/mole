from app.dependencies.db import DB 
from app.database.crud import get_config
from app.services import document_service
from app.core import exceptions
from app.schemas.status import DashboardStatusResponse

def get_dashboard_status(db: DB):
    config = get_config(db)
    if not config:
        raise exceptions.ConfigNotFoundError()
    
    pending_files = document_service.scan_pending_files(db)
    
    return DashboardStatusResponse(
        needs_rebuild=config.needs_rebuild,
        pending_files_count=len(pending_files.files),
        pending_files=pending_files.files,
        target_directory=config.target_directory
    )