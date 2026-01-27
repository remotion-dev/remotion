import { useState, useCallback, useRef } from "react";
import type {
  ConversationMessage,
  ConversationState,
  ConversationContextMessage,
  AssistantMetadata,
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
    (content: string, codeSnapshot: string, metadata?: AssistantMetadata) => {
      const message: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content,
        timestamp: Date.now(),
        codeSnapshot,
        metadata,
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

  const addErrorMessage = useCallback(
    (content: string, errorType: "edit_failed" | "api" | "validation") => {
      const message: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "error",
        content,
        timestamp: Date.now(),
        errorType,
      };
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
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

  // Get the last N conversation exchanges for context (excludes error messages)
  const getRecentContext = useCallback(
    (count: number = 3): ConversationContextMessage[] => {
      // Filter out error messages - they're not part of the conversation context for the AI
      const conversationMessages = state.messages.filter(
        (m) => m.role === "user" || m.role === "assistant",
      );
      const recentMessages = conversationMessages.slice(-count * 2);
      return recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.role === "user" ? m.content : "[Generated Code]",
      }));
    },
    [state.messages],
  );

  // Get all skills that have been used in the conversation (to avoid redundant skill content)
  const getPreviouslyUsedSkills = useCallback((): string[] => {
    const allSkills = new Set<string>();
    state.messages.forEach((m) => {
      if (m.role === "assistant" && m.metadata?.skills) {
        m.metadata.skills.forEach((skill) => allSkills.add(skill));
      }
    });
    return Array.from(allSkills);
  }, [state.messages]);

  return {
    ...state,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    markManualEdit,
    clearConversation,
    getRecentContext,
    getPreviouslyUsedSkills,
    isFirstGeneration: state.messages.length === 0,
  };
}
