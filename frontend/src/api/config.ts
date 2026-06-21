import { AppConfig } from "../types/config";

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchAppConfig = async (): Promise<AppConfig | null> => {
  const response = await fetch(`${API_BASE_URL}/config`);

  if (response.status === 404) return null;

  if (response.ok) {
    throw new Error("OH MY GOD WHAT A FAILURE");
  }

  return response.json();
};

export const saveConfig = async (payload: AppConfig) => {
  const response = await fetch(`${API_BASE_URL}/set-config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("failed to save config");
  }

  return response.json();
};
