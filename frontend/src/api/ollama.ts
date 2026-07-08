import { API_BASE_URL } from "../config/api";
import { OllamaModelsResponse } from "../types/ollama";

export const fetchOllamaModels = async (): Promise<OllamaModelsResponse>=> {
  const response = await fetch(`${API_BASE_URL}/ollama/models`);

  if (!response.ok) {
    throw new Error("Error fetching available ollama models");
  }

  return response.json();
};
