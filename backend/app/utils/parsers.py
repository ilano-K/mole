from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker.hybrid_chunker import HybridChunker

import docx
import os

""" 
if  pdf, docx, pptx -> docling extract
if txt, md, csv, json -> normal extract
"""

# init docling related document converter and chunker
converter = DocumentConverter()
chunker = HybridChunker(
    tokenizer="sentence-transformers/all-MiniLM-L6-v2",
    max_tokens=256,
    merge_peers=True,
)

# use hybrid text extraction
def extract_text(file_path: str):
    # Get file extension
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in ['.pdf', '.docx', '.pptx']:
        return docling_pipeline(file_path)
    if ext in ['.txt', '.md', '.csv', '.json']:
        # normal extract
        pass
    raise ValueError(f"Unsupported file format: {ext}")

# for pdf, docx, pptx file formats
def docling_pipeline(file_path: str):
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