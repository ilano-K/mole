export interface AppConfig {
  id: number;
  target_directory: string;
  include_subfolders: boolean;
  allowed_extensions: string[];
  updated_at?: string;
}
