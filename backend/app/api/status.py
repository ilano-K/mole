from app.schemas.status import DashboardStatusResponse
from fastapi import APIRouter
from app.dependencies.db import DB
from app.services import status_service

router = APIRouter(prefix="/status", tags=['status'])

@router.get('', response_model=DashboardStatusResponse)
def get_status(db: DB):
    return status_service.get_dashboard_status(db)
    