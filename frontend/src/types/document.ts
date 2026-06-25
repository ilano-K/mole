interface PendingFiles {
  files: string[];
}

interface IndexFile {
  file_path: string;
}

interface SearchDocument {
  query: string;
  n_results: number;
}
