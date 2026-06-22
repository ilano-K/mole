interface AppConfigBase {
  target_directory: string;
  include_subfolders: boolean;
  allowed_extensions: string[];
}

export interface AppConfig extends AppConfigBase {
  id: number;
  updated_at?: string;
}

export interface AppConfigCreate extends AppConfigBase {}
