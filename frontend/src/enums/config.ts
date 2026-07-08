export const EmbeddingProvider = {
  DEFAULT: "default",
  OLLAMA: "ollama",
  OPENAI: "openai",
  COHERE: "cohere",
  VOYAGE: "voyage",
  JINA: "jina",
} as const;

export type EmbeddingProvider =
  (typeof EmbeddingProvider)[keyof typeof EmbeddingProvider];

export const CLOUD_EMBEDDING_PROVIDERS: readonly EmbeddingProvider[] = [
  EmbeddingProvider.OPENAI,
  EmbeddingProvider.COHERE,
  EmbeddingProvider.JINA,
  EmbeddingProvider.VOYAGE,
];

export function isCloudEmbeddingProvider(provider: string | EmbeddingProvider) {
  return CLOUD_EMBEDDING_PROVIDERS.includes(provider as EmbeddingProvider);
}
