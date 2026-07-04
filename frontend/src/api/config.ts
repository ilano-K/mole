import { API_BASE_URL } from "../config/api";
import { AppConfigResponse, AppConfigCreate } from "../types/config";

export const fetchAppConfig = async (): Promise<AppConfigResponse | null> => {
  const response = await fetch(`${API_BASE_URL}/config`);

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error("OH MY GOD WHAT A FAILURE");
  }

  return response.json();
};

export const saveConfig = async (payload: AppConfigCreate) => {
  const response = await fetch(`${API_BASE_URL}/config/set-config`, {
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
