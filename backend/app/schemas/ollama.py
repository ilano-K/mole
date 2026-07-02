from pydantic import BaseModel
from typing import List

class OllamaModel(BaseModel):
    name: str

class OllamaModelsResponse(BaseModel):
    models: list[OllamaModel]