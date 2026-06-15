from fastapi import FastAPI
import chromadb

app = FastAPI(title="mole")

chroma_client = chromadb.PersistentClient(path="./chroma_data")

collection = chroma_client.get_or_create_collection(name='documents')

@app.get("/status")
def get_status():
    doc_count = collection.count()
    return {
        'status': 'online',
        'database': 'connected',
        'indexed_documents': doc_count
    }