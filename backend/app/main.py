from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.documents import router as documents_router
from app.api.config import router as config_router

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


    