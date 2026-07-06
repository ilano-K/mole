import chromadb 
from app.services.embedding_service import get_embedding_function

#1. initialize chroma client
chroma_client = chromadb.PersistentClient(path='./chroma_data')

#2. create or connect to the storage
collection = chroma_client.get_or_create_collection(
    name='documents',
    embedding_function=get_embedding_function
)

def recreate_collection():
    global collection

    try:
        chroma_client.delete_collection("documents")
    except Exception:
        # Collection might not exist
        pass

    collection = chroma_client.get_or_create_collection(
        name="documents",
        embedding_function=get_embedding_function,
    )
    
def sanitize_metadata(meta: dict) -> dict:
    """
    Forces all complex Docling data into clean strings to prevent ChromaDB crashes.
    """
    clean_meta = {}
    for key, value in meta.items():
        if isinstance(value, (str, int, float, bool)):
            clean_meta[key] = value
        elif value is None:
            clean_meta[key] = ""
        else:
            # Convert lists/nested dicts into raw JSON-like strings
            clean_meta[key] = str(value)
    return clean_meta

def insert_chunks(file_path: str, chunks: list[dict]):
    if not chunks:
        return 
    
    ids = []
    texts = []
    metadatas = []
    
    for i, chunk in enumerate(chunks):
        chunk_id = f"{file_path}_chunk{i}"
        
        clean_meta = sanitize_metadata(chunk['metadata'])
        clean_meta['file_path'] = file_path
        
        ids.append(chunk_id)
        texts.append(chunk['text'])
        metadatas.append(clean_meta )
        
    collection.upsert(
        ids=ids,
        documents=texts,
        metadatas=metadatas
    )
               
def search_documents(query: str, n_results: int = 5) -> dict:
    db_size = collection.count()
    if db_size == 0:
        return {"documents": [], "metadatas": [], "distances": []}
    
    safe_limit = min(n_results, db_size)
    
    results = collection.query(
        query_texts=[query],
        n_results=safe_limit
    )
    docs = results.get("documents")
    meta = results.get("metadatas")
    dist = results.get("distances")
    
    return {
        "documents": docs[0] if docs is not None else [],
        "metadatas": meta[0] if meta is not None else [],
        "distances": dist[0] if dist is not None else []
    }