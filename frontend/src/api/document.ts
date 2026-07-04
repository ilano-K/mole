import { API_BASE_URL } from "../config/api";
import {
  IndexFileRequest,
  PendingFilesResponse,
  SearchRequest,
  SearchResponse,
} from "../types/document";

export const scanPendingFiles =
  async (): Promise<PendingFilesResponse | null> => {
    const response = await fetch(`${API_BASE_URL}/documents/scan-pending`);

    if (!response.ok) {
      throw new Error("Error scaning pending files");
    }
    return response.json();
  };

export const indexFile = async (payload: IndexFileRequest) => {
  const response = await fetch(`${API_BASE_URL}/documents/index`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Error indexing file");
  }
  return response.json();
};

export const resetIndex = async () => {
  const response = await fetch(`${API_BASE_URL}/documents/reset-index`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Error reindexing files");
  }
};
export const searchDocument = async (
  payload: SearchRequest,
): Promise<SearchResponse> => {
  const response = await fetch(`${API_BASE_URL}/documents/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Error searching document");
  }

  return response.json();
};
