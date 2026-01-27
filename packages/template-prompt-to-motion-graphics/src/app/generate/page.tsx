"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CodeEditor } from "../../components/CodeEditor";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { PageLayout } from "../../components/PageLayout";
import { ChatHistory } from "../../components/ChatHistory";
import {
  PromptInput,
  type StreamPhase,
  type PromptInputRef,
  type GenerationErrorType,
} from "../../components/PromptInput";
import { examples } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useConversationState } from "../../hooks/useConversationState";

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

  // Conversation state for follow-up edits
  const {
    messages,
    hasManualEdits,
    addUserMessage,
    addAssistantMessage,
    markManualEdit,
    clearConversation,
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
    (generatedCode: string) => {
      addAssistantMessage("Generated code", generatedCode);
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
  const promptInputRef = useRef<PromptInputRef>(null);

  useEffect(() => {
    if (initialPrompt && !hasAutoStarted && promptInputRef.current) {
      setHasAutoStarted(true);
      // Small delay to ensure component is mounted
      setTimeout(() => {
        promptInputRef.current?.triggerGeneration();
      }, 100);
    }
  }, [initialPrompt, hasAutoStarted]);

  return (
    <PageLayout showLogoAsLink>
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Chat History Sidebar */}
        <ChatHistory
          messages={messages}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onClear={clearConversation}
          hasManualEdits={hasManualEdits}
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

          <PromptInput
            ref={promptInputRef}
            onCodeGenerated={handleCodeChange}
            onStreamingChange={handleStreamingChange}
            onStreamPhaseChange={setStreamPhase}
            onError={handleError}
            prompt={prompt}
            onPromptChange={setPrompt}
            currentCode={code}
            conversationHistory={getRecentContext(3)}
            isFollowUp={!isFirstGeneration}
            hasManualEdits={hasManualEdits}
            onMessageSent={handleMessageSent}
            onGenerationComplete={handleGenerationComplete}
          />
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
