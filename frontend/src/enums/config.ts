export const EmbeddingProvider = {
  DEFAULT: "default",
  OLLAMA: "ollama",
  CLOUD: "cloud",
} as const;

export type EmbeddingProvider =
  (typeof EmbeddingProvider)[keyof typeof EmbeddingProvider];
