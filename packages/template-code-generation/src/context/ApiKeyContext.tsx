"use client";

import { createContext, useContext, ReactNode } from "react";
import { useApiKey } from "../hooks/useApiKey";

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasApiKey: boolean;
  isLoaded: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const apiKeyState = useApiKey();

  return (
    <ApiKeyContext.Provider value={apiKeyState}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeyContext() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKeyContext must be used within an ApiKeyProvider");
  }
  return context;
}
