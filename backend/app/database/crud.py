from sqlalchemy.orm import Session
from app.database import models 
from app.schemas.config import AppConfigCreate
from app.schemas.document import DocumentCreate

# ==========================================
# APP CONFIGURATION CRUD
# ==========================================

def get_config(db: Session): 
    """Fetch the single app config"""
    return db.query(models.AppConfig).first()

def upsert_config(db: Session, config_data: AppConfigCreate):
    db_config = get_config(db)
    
    if db_config:
        db_config.target_directory = config_data.target_directory
        db_config.allowed_extensions = config_data.allowed_extensions
        db_config.include_subfolders = config_data.include_subfolders
        db_config.embedding_provider = config_data.embedding_provider
        db_config.embedding_model = config_data.embedding_model
        db_config.api_key = config_data.api_key
    else:
        db_config = models.AppConfig(
            id=1,
            target_directory=config_data.target_directory,
            include_subfolders=config_data.include_subfolders,
            allowed_extensions = config_data.allowed_extensions,
            embedding_provider = config_data.embedding_provider,
            embedding_model = config_data.embedding_model,
            api_key = config_data.api_key,
        )
        db.add(db_config)
    
    db.commit()
    db.refresh(db_config)
    return db_config


# ==========================================
# DOCUMENT CRUD
# ==========================================
def create_document(db: Session, document_data: DocumentCreate):
    db_document = models.Document(**document_data.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document
    
def get_document_by_path(db:Session, file_path:str):
    return db.query(models.Document).filter(models.Document.file_path == file_path).first()

# ==========================================
# SEARCH HISTORY CRUD (For the UI)
# ==========================================