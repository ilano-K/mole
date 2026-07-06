from app.database.models import AppConfig
from app.enums.embedding import EmbeddingProvider
from chromadb.utils.embedding_functions import (
    SentenceTransformerEmbeddingFunction, OpenAIEmbeddingFunction,
    OllamaEmbeddingFunction,
)

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
    if config.embedding_provider == EmbeddingProvider.OLLAMA:
        return OllamaEmbeddingFunction(model_name=embedding_model)
    
    if config.embedding_provider == EmbeddingProvider.CLOUD:
        return OpenAIEmbeddingFunction(model_name=embedding_model, api_key=config.api_key)
    
    return SentenceTransformerEmbeddingFunction(model_name=embedding_model)
    