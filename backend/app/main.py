from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.documents import router as documents_router
from app.api.config import router as config_router
from app.api.status import router as status_router
from app.api.ollama import router as ollama_router
from app.core.exceptions import AppException
from app.database.database import Base, engine
import uvicorn
import logging 

logging.basicConfig(
    filename="mole.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)
logger.info("Application starting...")

Base.metadata.create_all(bind=engine)
app = FastAPI(title="mole")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows POST, GET, PUT, DELETE
    allow_headers=["*"], 
)

app.include_router(documents_router)
app.include_router(config_router)
app.include_router(status_router)
app.include_router(ollama_router)

@app.exception_handler(AppException)
def app_exception_handler(req: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    
if __name__ == "__main__":
    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)