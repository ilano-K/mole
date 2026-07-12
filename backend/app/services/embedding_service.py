from app.database.models import AppConfig
from app.enums.embedding import EmbeddingProvider
from chromadb.utils.embedding_functions import (
    SentenceTransformerEmbeddingFunction, OpenAIEmbeddingFunction,
    OllamaEmbeddingFunction, CohereEmbeddingFunction, VoyageAIEmbeddingFunction, JinaEmbeddingFunction
)
import logging 

logger = logging.getLogger(__name__)

_cached_embedding = None 
_cached_config = None 

def get_embedding_function(config: AppConfig):
    global _cached_config, _cached_embedding
    
    key = (
        config.embedding_provider,
        config.embedding_model,
        config.api_key
    )
    
    # COMPARE FETCHED CONFIG AND CACHED CONFIG
    if key != _cached_config:
        # Create embedding function if key and cache doesn't match
        _cached_embedding = create_embedding(config)
        # update the cache
        _cached_config = key 
    
    return _cached_embedding


def create_embedding(config: AppConfig):
    embedding_model = config.embedding_model
    api_key = config.api_key
    
    logger.info(f"Embedding model: {embedding_model}")
    # === LOCAL ===
    if config.embedding_provider == EmbeddingProvider.OLLAMA:
        return OllamaEmbeddingFunction(model_name=embedding_model)
    
    # === CLOUD PROVIDERS ===
    if config.embedding_provider == EmbeddingProvider.OPENAI:
        return OpenAIEmbeddingFunction(model_name=embedding_model, api_key=api_key)
    
    if config.embedding_provider == EmbeddingProvider.COHERE:
        return CohereEmbeddingFunction(model_name=embedding_model, api_key=api_key)
    
    if config.embedding_provider == EmbeddingProvider.JINA:
        return JinaEmbeddingFunction(model_name=embedding_model, api_key=api_key)
    
    if config.embedding_provider == EmbeddingProvider.VOYAGE:
        return VoyageAIEmbeddingFunction(model_name=embedding_model, api_key=api_key)

    # === default === 
    if not embedding_model or not embedding_model.strip():
        embedding_model = "all-MiniLM-L6-v2"
    return SentenceTransformerEmbeddingFunction(model_name=embedding_model)
    