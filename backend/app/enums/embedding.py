from enum import Enum

class EmbeddingProvider(str, Enum):
    DEFAULT = "default"
    OLLAMA = "ollama"
    CLOUD = "cloud"