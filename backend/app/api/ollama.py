from fastapi import APIRouter, HTTPException
from app.schemas.ollama import OllamaModelsResponse
from app.constants.embedding_models import OLLAMA_MODELS
import requests


router = APIRouter(prefix="/ollama", tags=['ollama'])

@router.get("/models", response_model=OllamaModelsResponse)
def get_ollama_models():
    # ollama
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        response.raise_for_status()
    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama. Is it running?"
        )
    data = response.json()
    
    valid_embedding_models = []
    for model in data['models']:
        name = model["name"]
        base_name = name.split(":")[0]
        
        if base_name in OLLAMA_MODELS:
            valid_embedding_models.append(name)
        
    return OllamaModelsResponse(models=valid_embedding_models)
        