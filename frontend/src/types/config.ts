import { EmbeddingProvider } from "../enums/config";

export interface AppConfigBase {
  target_directory: string;
  include_subfolders: boolean;
  allowed_extensions: string[];
  embedding_provider: EmbeddingProvider;
  embedding_model?: string;
  api_key?: string;
  needs_reindex?: boolean;
}

export interface AppConfigResponse extends AppConfigBase {
  id: number;
  updated_at?: string;
}

export interface AppConfigCreate extends AppConfigBase {}
