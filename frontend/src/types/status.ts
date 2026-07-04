export interface FetchStatusResponse {
  needs_rebuild: boolean;
  pending_files_count: number;
  pending_files: string[];
  target_directory: string;
}
