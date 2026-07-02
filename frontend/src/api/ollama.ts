import { API_BASE_URL } from "../config/api";

export const fetchOllamaModels = async () => {
  const response = await fetch(`${API_BASE_URL}/ollama/models`);

  if (!response.ok) {
    throw new Error("Error fetching available ollama models");
  }

  return response.json();
};
