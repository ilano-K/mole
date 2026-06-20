from fastapi import HTTPException, APIRouter

from app.dependencies.db import DB 
from app.schemas.config import AppConfigResponse, AppConfigCreate
from app.services import document_service

router = APIRouter(tags=['config'])

@router.post('/set-config', response_model=AppConfigResponse)
def set_config(payload: AppConfigCreate, db: DB):
    return document_service.save_config(db, payload)
    