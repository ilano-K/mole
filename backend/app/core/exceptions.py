class AppException(Exception):
    status_code: int = 500
    detail: str = "Internal Server Error"

class UnsupportedFileFormatError(AppException):
    status_code = 400
    detail = "Unsupported file format"
    
class DocumentFileNotFoundError(AppException):
    status_code = 404
    detail = "File not found"
class EmptyFileListError(AppException):
    status_code = 400
    detail = "No files provided"

class ConfigNotFoundError(AppException):
    status_code = 404
    detail = "Config not found" 

class FileIndexingError(AppException):
    status_code = 500
    detail = "File indexing error"

class FileDirectoryNotFoundError(AppException):
    status_code = 404
    detail = "File not found"