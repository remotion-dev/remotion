"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CodeEditor } from "../../components/CodeEditor";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { PageLayout } from "../../components/PageLayout";
import { ChatHistory, type ChatHistoryRef } from "../../components/ChatHistory";
import {
  type StreamPhase,
  type GenerationErrorType,
} from "../../components/PromptInput";
import { examples } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useConversationState } from "../../hooks/useConversationState";
import type {
  AssistantMetadata,
  ErrorCorrectionContext,
} from "../../types/conversation";

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  // If we have an initial prompt from URL, start in streaming state
  // so syntax highlighting is disabled from the beginning
  const willAutoStart = Boolean(initialPrompt);

  const [durationInFrames, setDurationInFrames] = useState(
    examples[0]?.durationInFrames || 150,
  );
  const [fps, setFps] = useState(examples[0]?.fps || 30);
  const [isStreaming, setIsStreaming] = useState(willAutoStart);
  const [streamPhase, setStreamPhase] = useState<StreamPhase>(
    willAutoStart ? "reasoning" : "idle",
  );
  const [prompt, setPrompt] = useState(initialPrompt);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [generationError, setGenerationError] = useState<{
    message: string;
    type: GenerationErrorType;
  } | null>(null);

  // Self-correction state
  const MAX_CORRECTION_ATTEMPTS = 3;
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionContext | null>(null);

  // Conversation state for follow-up edits
  const {
    messages,
    hasManualEdits,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    markManualEdit,
    getRecentContext,
    isFirstGeneration,
  } = useConversationState();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { code, Component, error, isCompiling, setCode, compileCode } =
    useAnimationState(examples[0]?.code || "");

  // Debounce compilation
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isStreamingRef = useRef(isStreaming);
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = isStreaming;

    // Compile when streaming ends
    if (wasStreaming && !isStreaming) {
      compileCode(codeRef.current);
    }
  }, [isStreaming, compileCode]);

  // Auto-correction effect: trigger when compilation error occurs after generation
  const lastPromptRef = useRef<string>("");
  useEffect(() => {
    // Only auto-correct if:
    // 1. There's a compilation error (not generation error)
    // 2. We're not currently streaming
    // 3. We haven't exceeded max attempts
    // 4. We have code to correct
    if (
      error &&
      !isStreaming &&
      !isCompiling &&
      !generationError &&
      hasGeneratedOnce &&
      code.trim()
    ) {
      const currentAttempt = errorCorrection?.attemptNumber ?? 0;

      if (currentAttempt < MAX_CORRECTION_ATTEMPTS) {
        // Set up auto-correction
        const nextAttempt = currentAttempt + 1;
        console.log(
          `Auto-correction attempt ${nextAttempt}/${MAX_CORRECTION_ATTEMPTS} for error:`,
          error
        );

        // Add error to conversation history
        addErrorMessage(`Compilation error: ${error}`, "validation");

        setErrorCorrection({
          error,
          attemptNumber: nextAttempt,
          maxAttempts: MAX_CORRECTION_ATTEMPTS,
        });

        // Store prompt for auto-trigger and set it
        const correctionPrompt = "Fix the compilation error";
        lastPromptRef.current = correctionPrompt;
        setPrompt(correctionPrompt);

        // Trigger generation after a short delay
        setTimeout(() => {
          chatHistoryRef.current?.triggerGeneration();
        }, 100);
      }
    }

    // Clear error correction state on successful compilation
    if (!error && !isCompiling && errorCorrection) {
      setErrorCorrection(null);
    }
  }, [
    error,
    isStreaming,
    isCompiling,
    generationError,
    hasGeneratedOnce,
    code,
    errorCorrection,
    addErrorMessage,
    setPrompt,
  ]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setHasGeneratedOnce(true);

      // Mark as manual edit if not streaming (user typing)
      if (!isStreamingRef.current) {
        markManualEdit(newCode);
      }

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Skip compilation while streaming - will compile when streaming ends
      if (isStreamingRef.current) {
        return;
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        compileCode(newCode);
      }, 500);
    },
    [setCode, compileCode, markManualEdit],
  );

  // Handle message sent for history
  const handleMessageSent = useCallback(
    (promptText: string) => {
      addUserMessage(promptText);
    },
    [addUserMessage],
  );

  // Handle generation complete for history
  const handleGenerationComplete = useCallback(
    (generatedCode: string, summary?: string, metadata?: AssistantMetadata) => {
      const content = summary || "Generated your animation, any follow up edits?";
      addAssistantMessage(content, generatedCode, metadata);
    },
    [addAssistantMessage],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleStreamingChange = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    // Clear errors when starting a new generation
    if (streaming) {
      setGenerationError(null);
    }
  }, []);

  const handleError = useCallback(
    (message: string, type: GenerationErrorType) => {
      setGenerationError({ message, type });
    },
    [],
  );

  // Auto-trigger generation if prompt came from URL
  const chatHistoryRef = useRef<ChatHistoryRef>(null);

  useEffect(() => {
    if (initialPrompt && !hasAutoStarted && chatHistoryRef.current) {
      setHasAutoStarted(true);
      // Small delay to ensure component is mounted
      setTimeout(() => {
        chatHistoryRef.current?.triggerGeneration();
      }, 100);
    }
  }, [initialPrompt, hasAutoStarted]);

  return (
    <PageLayout showLogoAsLink>
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Chat History Sidebar */}
        <ChatHistory
          ref={chatHistoryRef}
          messages={messages}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          hasManualEdits={hasManualEdits}
          // PromptInput props for embedded input
          onCodeGenerated={handleCodeChange}
          onStreamingChange={handleStreamingChange}
          onStreamPhaseChange={setStreamPhase}
          onError={handleError}
          prompt={prompt}
          onPromptChange={setPrompt}
          currentCode={code}
          conversationHistory={getRecentContext(3)}
          isFollowUp={!isFirstGeneration}
          onMessageSent={handleMessageSent}
          onGenerationComplete={handleGenerationComplete}
          onErrorMessage={addErrorMessage}
          errorCorrection={errorCorrection ?? undefined}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 px-12 pb-8 gap-8 overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden gap-8">
            <CodeEditor
              code={hasGeneratedOnce && !generationError ? code : ""}
              onChange={handleCodeChange}
              isStreaming={isStreaming}
              streamPhase={streamPhase}
            />
            <div className="shrink-0 lg:shrink lg:flex-[2.5] lg:min-w-0 lg:h-full">
              <AnimationPlayer
                Component={generationError ? null : Component}
                durationInFrames={durationInFrames}
                fps={fps}
                onDurationChange={setDurationInFrames}
                onFpsChange={setFps}
                isCompiling={isCompiling}
                isStreaming={isStreaming}
                error={generationError?.message || error}
                errorType={generationError?.type || "compilation"}
                code={code}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
    </div>
  );
}

const GeneratePage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratePageContent />
    </Suspense>
  );
};

export default GeneratePage;
