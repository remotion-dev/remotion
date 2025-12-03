"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "openai-api-key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setApiKeyState(stored);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage and update state
  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem(STORAGE_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Clear API key
  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    isLoaded,
    hasApiKey: !!apiKey,
  };
}
