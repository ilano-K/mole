import { API_BASE_URL } from "../config/api";
import { FetchStatusResponse } from "../types/status";

export const fetchStatus = async (): Promise<FetchStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/status`);

  if (!response.ok) {
    throw new Error("Error fetching status");
  }

  return response.json();
};
