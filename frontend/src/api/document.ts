import { API_BASE_URL } from "../config/api";

export const scanPendingFiles = async (): Promise<PendingFiles | null> => {
  const response = await fetch(`${API_BASE_URL}/scan-pending`);

  if (!response.ok) {
    throw new Error("Error scaning pending files");
  }
  return response.json();
};

export const indexFile = async (payload: IndexFile) => {
  const response = await fetch(`${API_BASE_URL}/index`, {
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

export const searchDocument = async (payload: SearchDocument) => {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Error searching document");
  }

  return response.json();
};
