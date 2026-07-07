export const CLOUD_PROVIDERS = {
  openai: {
    label: "OpenAI",
    models: ["text-embedding-3-small", "text-embedding-3-large"],
  },

  cohere: {
    label: "Cohere",
    models: ["embed-v4.0", "embed-english-v3.0", "embed-multilingual-v3.0"],
  },

  jina: {
    label: "Jina AI",
    models: ["jina-embeddings-v3"],
  },

  voyage: {
    label: "Voyage AI",
    models: ["voyage-3-large", "voyage-3", "voyage-lite-02-instruct"],
  },
} as const;
