from enum import Enum

class EmbeddingProvider(str, Enum):
    DEFAULT = "default"
    OLLAMA = "ollama"
    OPENAI = "openai"
    COHERE = "cohere"
    JINA = "jina"
    VOYAGE = "voyage"