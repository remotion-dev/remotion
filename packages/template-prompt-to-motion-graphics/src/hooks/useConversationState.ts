import { useState, useCallback, useRef } from "react";
import type {
  ConversationMessage,
  ConversationState,
  ConversationContextMessage,
} from "@/types/conversation";

export function useConversationState() {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    hasManualEdits: false,
    lastGenerationTimestamp: null,
  });

  // Track the last AI-generated code to detect manual edits
  const lastAiCodeRef = useRef<string>("");

  const addUserMessage = useCallback((content: string) => {
    const message: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
    return message.id;
  }, []);

  const addAssistantMessage = useCallback(
    (content: string, codeSnapshot: string) => {
      const message: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content,
        timestamp: Date.now(),
        codeSnapshot,
      };
      lastAiCodeRef.current = codeSnapshot;
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
        hasManualEdits: false,
        lastGenerationTimestamp: Date.now(),
      }));
      return message.id;
    },
    [],
  );

  const markManualEdit = useCallback((currentCode: string) => {
    // Only mark as manual edit if code differs from last AI generation
    if (currentCode !== lastAiCodeRef.current && lastAiCodeRef.current !== "") {
      setState((prev) => ({
        ...prev,
        hasManualEdits: true,
      }));
    }
  }, []);

  const clearConversation = useCallback(() => {
    lastAiCodeRef.current = "";
    setState({
      messages: [],
      hasManualEdits: false,
      lastGenerationTimestamp: null,
    });
  }, []);

  // Get the last N conversation exchanges for context
  const getRecentContext = useCallback(
    (count: number = 3): ConversationContextMessage[] => {
      const recentMessages = state.messages.slice(-count * 2);
      return recentMessages.map((m) => ({
        role: m.role,
        content: m.role === "user" ? m.content : "[Generated Code]",
      }));
    },
    [state.messages],
  );

  return {
    ...state,
    addUserMessage,
    addAssistantMessage,
    markManualEdit,
    clearConversation,
    getRecentContext,
    isFirstGeneration: state.messages.length === 0,
  };
}
