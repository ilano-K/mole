import { API_BASE_URL } from "../config/api";

export const scanPendingFiles = async (): Promise<PendingFiles | null> => {
  const response = await fetch(`${API_BASE_URL}/scan-pending`);

  if (!response.ok) {
    throw new Error("Error scaning pending files");
  }
  return response.json();
};
