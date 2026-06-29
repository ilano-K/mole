import { EmbeddingProvider } from "../enums/config";

interface AppConfigBase {
  target_directory: string;
  include_subfolders: boolean;
  allowed_extensions: string[];
  embedding_provider: EmbeddingProvider;
  embedding_model?: string;
  api_key?: string;
}

export interface AppConfig extends AppConfigBase {
  id: number;
  updated_at?: string;
}

export interface AppConfigCreate extends AppConfigBase {}
