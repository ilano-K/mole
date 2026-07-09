from pathlib import Path
from app.schemas.config import AppConfigCreate
from sqlalchemy.orm import Session
from app.core import exceptions
from app.database import crud 
import logging

logger = logging.getLogger(__name__)

def save_config(payload: AppConfigCreate, db: Session):
    logger.info("Config:")
    logger.info("Provider: %s", payload.embedding_provider)
    logger.info("Model: %s", payload.embedding_model)
    logger.info("API Key: %s", payload.api_key)
    logger.info("Target Directory: %s", payload.target_directory)
    
    dir_path = Path(payload.target_directory)
    
    if not dir_path.exists():
        raise exceptions.DocumentFileNotFoundError()
    
    return crud.upsert_config(db, payload)

def get_config(db: Session):
    config = crud.get_config(db)
    
    if not config:
        raise exceptions.ConfigNotFoundError()
    
    logger.info("Config:")
    logger.info("Provider: %s", config.embedding_provider)
    logger.info("Model: %s", config.embedding_model)
    logger.info("API Key: %s", config.api_key)
    logger.info("Target Directory: %s", config.target_directory)
    
    return config 