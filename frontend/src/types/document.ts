export interface PendingFilesResponse {
  files: string[];
}

export interface IndexFileRequest {
  file_path: string;
}

export interface SearchRequest {
  query: string;
  n_results?: number;
}

export interface SearchResult {
  file_path: string;
  filename: string;
  excerpt: string;
  distance: number;
}

export interface SearchResponse {
  results: SearchResult[];
}
