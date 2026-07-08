from fastapi import APIRouter
from app.dependencies.db import DB 
from app.schemas.config import AppConfigResponse, AppConfigCreate
from app.services import config_service

router = APIRouter(prefix="/config", tags=['config'])

@router.post('/set-config', response_model=AppConfigResponse)
def set_config(payload: AppConfigCreate, db: DB):
    return config_service.save_config(payload, db)
    
@router.get('', response_model=AppConfigResponse)
def get_config(db: DB):
    return config_service.get_config(db)