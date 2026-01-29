import { useEffect, useRef, useCallback } from "react";
import type { ErrorCorrectionContext, EditOperation } from "@/types/conversation";

interface AutoCorrectionConfig {
  maxAttempts: number;
  /** Compilation error from useAnimationState */
  compilationError: string | null;
  /** Generation/API error */
  generationError: { message: string; type: string; failedEdit?: EditOperation } | null;
  /** Whether code is currently being generated */
  isStreaming: boolean;
  /** Whether code is currently being compiled */
  isCompiling: boolean;
  /** Whether any generation has occurred */
  hasGeneratedOnce: boolean;
  /** Current code content */
  code: string;
  /** Current error correction context */
  errorCorrection: ErrorCorrectionContext | null;
  /** Callbacks */
  onTriggerCorrection: (prompt: string, errorContext: ErrorCorrectionContext) => void;
  onAddErrorMessage: (message: string, type: "edit_failed" | "api" | "validation", failedEdit?: EditOperation) => void;
  onClearGenerationError: () => void;
  onClearErrorCorrection: () => void;
}

/**
 * Hook to handle auto-correction of AI-generated code errors.
 * Tracks whether errors are from AI or user edits, and only auto-corrects AI errors.
 */
export function useAutoCorrection({
  maxAttempts,
  compilationError,
  generationError,
  isStreaming,
  isCompiling,
  hasGeneratedOnce,
  code,
  errorCorrection,
  onTriggerCorrection,
  onAddErrorMessage,
  onClearGenerationError,
  onClearErrorCorrection,
}: AutoCorrectionConfig) {
  // Track whether last code change was from AI or user
  const lastChangeSourceRef = useRef<"ai" | "user">("ai");

  // Mark code as AI-generated
  const markAsAiGenerated = useCallback(() => {
    lastChangeSourceRef.current = "ai";
  }, []);

  // Mark code as user-edited
  const markAsUserEdited = useCallback(() => {
    lastChangeSourceRef.current = "user";
  }, []);

  // Check if we should attempt auto-correction
  const shouldAutoCorrect = useCallback(() => {
    return (
      hasGeneratedOnce &&
      !isStreaming &&
      lastChangeSourceRef.current === "ai" &&
      (errorCorrection?.attemptNumber ?? 0) < maxAttempts
    );
  }, [hasGeneratedOnce, isStreaming, errorCorrection, maxAttempts]);

  // Handle compilation errors
  useEffect(() => {
    if (
      compilationError &&
      !isCompiling &&
      !generationError &&
      code.trim() &&
      shouldAutoCorrect()
    ) {
      const nextAttempt = (errorCorrection?.attemptNumber ?? 0) + 1;
      console.log(
        `Auto-correction attempt ${nextAttempt}/${maxAttempts} for compilation error:`,
        compilationError
      );

      onAddErrorMessage(`Compilation error: ${compilationError}`, "validation");
      onTriggerCorrection("Fix the compilation error", {
        error: compilationError,
        attemptNumber: nextAttempt,
        maxAttempts,
      });
    }

    // Clear error correction state on successful compilation
    if (!compilationError && !isCompiling && errorCorrection) {
      onClearErrorCorrection();
    }
  }, [
    compilationError,
    isCompiling,
    generationError,
    code,
    errorCorrection,
    maxAttempts,
    shouldAutoCorrect,
    onAddErrorMessage,
    onTriggerCorrection,
    onClearErrorCorrection,
  ]);

  // Handle generation/API errors
  useEffect(() => {
    if (generationError && shouldAutoCorrect()) {
      const nextAttempt = (errorCorrection?.attemptNumber ?? 0) + 1;
      console.log(
        `Auto-retry attempt ${nextAttempt}/${maxAttempts} for generation error:`,
        generationError.message
      );

      onClearGenerationError();
      onTriggerCorrection("Retry the previous request", {
        error: generationError.message,
        attemptNumber: nextAttempt,
        maxAttempts,
        failedEdit: generationError.failedEdit,
      });
    }
  }, [
    generationError,
    errorCorrection,
    maxAttempts,
    shouldAutoCorrect,
    onClearGenerationError,
    onTriggerCorrection,
  ]);

  return {
    markAsAiGenerated,
    markAsUserEdited,
  };
}
