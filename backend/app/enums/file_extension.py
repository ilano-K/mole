from enum import Enum 

class FileExtensions(str, Enum):
    PDF = ".pdf"
    DOCX = ".docx"
    PPTX = ".pptx"
    TXT = ".txt"