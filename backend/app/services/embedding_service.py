from app.database.models import AppConfig
from app.enums.embedding import EmbeddingProvider
from chromadb.utils.embedding_functions import (
    SentenceTransformerEmbeddingFunction, OpenAIEmbeddingFunction,
    OllamaEmbeddingFunction,
)
def get_embedding_function(config: AppConfig):
    embedding_model = config.embedding_model
    if config.embedding_provider == EmbeddingProvider.OLLAMA:
        return OllamaEmbeddingFunction(model_name=embedding_model)
    
    if config.embedding_provider == EmbeddingProvider.CLOUD:
        return OpenAIEmbeddingFunction(model_name=embedding_model)
    
    return SentenceTransformerEmbeddingFunction(model_name=embedding_model)
    