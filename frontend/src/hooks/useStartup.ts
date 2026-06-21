import { useState, useEffect } from "react";
import { fetchAppConfig } from "../api/config";

export function useStartup() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const config = await fetchAppConfig();
        // If config is not null, setup is complete!
        setIsConfigured(config !== null);
      } catch (error) {
        console.error("Startup check failed:", error);
        // Default to the setup screen if backend is unreachable
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConfig();
  }, []);

  return { isConfigured, isLoading };
}
