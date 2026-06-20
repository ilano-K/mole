from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker.hybrid_chunker import HybridChunker
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.exceptions import UnsupportedFileFormatError
import os

# init docling related document converter and chunker
converter = DocumentConverter()
chunker = HybridChunker(
    tokenizer="sentence-transformers/all-MiniLM-L6-v2",
    max_tokens=384,
    merge_peers=True,
)

# use hybrid text extraction
def extract_text(file_path: str):
    # Get file extension
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in ['.pdf', '.docx', '.pptx', '.md']:
        return docling_pipeline(file_path)
    if ext in ['.txt']:
        return default_pipeline(file_path, ext)
    raise UnsupportedFileFormatError()

# for pdf, docx, pptx file formats
def docling_pipeline(file_path: str) -> list[dict]:
    result = converter.convert(file_path)
    doc = result.document
    
    chunk_generator = chunker.chunk(doc)
    
    formatted_chunks = []
    for chunk in chunk_generator:
        formatted_chunks.append({
            "text": chunk.text,
            "metadata": chunk.meta.export_json_dict()
        })
    return formatted_chunks

def default_pipeline(file_path: str, file_format:str):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(text)
    
    formatted_chunks = []
    for chunk in chunks:
        formatted_chunks.append({
            "text": chunk,
            "metadata":{
                "file_format": file_format
            }
        })
    return formatted_chunks