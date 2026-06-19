from fastapi import HTTPException, APIRouter

from app.dependencies.db import DB 
from app.schemas.schemas import AppConfigResponse, AppConfigCreate
from app.services import document_service

router = APIRouter(tags=['config'])

@router.post('/set-config', response_model=AppConfigResponse)
def set_config(payload: AppConfigCreate, db: DB):
    try:
        return document_service.save_config(db, payload)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Directory does not exist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    