from sqlalchemy import (
    Column, Integer, String, Boolean, 
    JSON, DateTime, Float, 
    Enum as SQLAlchemyEnum
)
from datetime import datetime, timezone
from app.database.database import Base
from app.enums.embedding import EmbeddingProvider
def get_utc_now():
    return datetime.now(timezone.utc)
# Config Table
class AppConfig(Base):
    __tablename__ = "app_config"
    
    id = Column(Integer, primary_key=True, index=True)
    target_directory = Column(String, nullable=False)
    include_subfolders = Column(Boolean, default=True)
    allowed_extensions = Column(JSON, nullable=False)
    
    embedding_provider = Column(SQLAlchemyEnum(EmbeddingProvider), default=EmbeddingProvider.DEFAULT, nullable=False)
    embedding_model = Column(String, default="all-MiniLM-L6-v2", nullable=False)
    api_key = Column(String, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

# Documents table
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_path = Column(String, unique= True, index=True)
    last_modified = Column(Float)
    last_indexed = Column(DateTime(timezone=True), default=get_utc_now)

# Search History table
class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now)