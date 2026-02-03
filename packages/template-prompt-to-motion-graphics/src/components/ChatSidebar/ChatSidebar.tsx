"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  type ComponentType,
} from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  FileCode,
  AlertTriangle,
  PenLine,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  ConversationMessage,
  ConversationContextMessage,
  AssistantMetadata,
  ErrorCorrectionContext,
  EditOperation,
} from "@/types/conversation";
import {
  type StreamPhase,
  type GenerationErrorType,
  type ModelId,
  MODELS,
} from "@/types/generation";
import { ChatInput } from "./ChatInput";
import { useGenerationApi } from "@/hooks/useGenerationApi";

export interface ChatSidebarRef {
  triggerGeneration: (options?: { silent?: boolean; attachedImages?: string[] }) => void;
}

interface ChatSidebarProps {
  messages: ConversationMessage[];
  pendingMessage?: {
    skills?: string[];
    startedAt: number;
  };
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasManualEdits: boolean;
  // Generation callbacks
  onCodeGenerated?: (code: string) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  onStreamPhaseChange?: (phase: StreamPhase) => void;
  onError?: (error: string, type: GenerationErrorType, failedEdit?: EditOperation) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  currentCode?: string;
  conversationHistory?: ConversationContextMessage[];
  previouslyUsedSkills?: string[];
  isFollowUp?: boolean;
  onMessageSent?: (prompt: string, attachedImages?: string[]) => void;
  onGenerationComplete?: (
    code: string,
    summary?: string,
    metadata?: AssistantMetadata,
  ) => void;
  onErrorMessage?: (
    message: string,
    errorType: "edit_failed" | "api" | "validation",
  ) => void;
  errorCorrection?: ErrorCorrectionContext;
  onPendingMessage?: (skills?: string[]) => void;
  onClearPendingMessage?: () => void;
  // Frame capture props
  Component?: ComponentType | null;
  fps?: number;
  durationInFrames?: number;
  currentFrame?: number;
}

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(
  function ChatSidebar(
    {
      messages,
      pendingMessage,
      isCollapsed,
      onToggleCollapse,
      hasManualEdits,
      onCodeGenerated,
      onStreamingChange,
      onStreamPhaseChange,
      onError,
      prompt,
      onPromptChange,
      currentCode,
      conversationHistory = [],
      previouslyUsedSkills = [],
      isFollowUp = false,
      onMessageSent,
      onGenerationComplete,
      onErrorMessage,
      errorCorrection,
      onPendingMessage,
      onClearPendingMessage,
      Component,
      fps = 30,
      durationInFrames = 150,
      currentFrame = 0,
    },
    ref,
  ) {
    const [model, setModel] = useState<ModelId>(MODELS[1].id);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const promptRef = useRef<string>("");

    const { isLoading, runGeneration } = useGenerationApi();

    // Keep prompt ref in sync for use in triggerGeneration
    useEffect(() => {
      promptRef.current = prompt;
    }, [prompt]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleGeneration = async (options?: {
      silent?: boolean;
      attachedImages?: string[];
    }) => {
      const currentPrompt = promptRef.current;
      if (!currentPrompt.trim()) return;

      onPromptChange(""); // Clear input immediately

      await runGeneration(
        currentPrompt,
        model,
        {
          currentCode,
          conversationHistory,
          previouslyUsedSkills,
          isFollowUp,
          hasManualEdits,
          errorCorrection,
          frameImages: options?.attachedImages,
        },
        {
          onCodeGenerated,
          onStreamingChange,
          onStreamPhaseChange,
          onError,
          onMessageSent,
          onGenerationComplete,
          onErrorMessage,
          onPendingMessage,
          onClearPendingMessage,
        },
        options,
      );
    };

    // Expose triggerGeneration via ref
    useImperativeHandle(ref, () => ({
      triggerGeneration: handleGeneration,
    }));

    return (
      <div
        className={cn(
          "flex flex-col bg-background transition-all duration-300 shrink-0",
          isCollapsed ? "w-12" : "w-[420px]",
        )}
      >
        {isCollapsed ? (
          <div className="flex justify-center px-4 mb-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-4 mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Assistant Chat
              </h2>
              <div className="flex items-center gap-1 -mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Start over? This will reset your animation.",
                      )
                    ) {
                      window.location.href = "/";
                    }
                  }}
                  title="Start over"
                  className="text-muted-foreground hover:text-foreground text-xs gap-1 h-7 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleCollapse}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {pendingMessage && (
                <PendingMessage skills={pendingMessage.skills} />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput
              prompt={prompt}
              onPromptChange={onPromptChange}
              model={model}
              onModelChange={setModel}
              isLoading={isLoading}
              onSubmit={(attachedImages) =>
                handleGeneration({ attachedImages })
              }
              Component={Component}
              fps={fps}
              durationInFrames={durationInFrames}
              currentFrame={currentFrame}
            />
          </>
        )}
      </div>
    );
  },
);

function ChatMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const metadata = message.metadata;

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">You</span>
          <span className="text-xs text-muted-foreground-dim">{time}</span>
        </div>
        <div className="text-sm text-foreground leading-relaxed bg-secondary/50 rounded-lg px-3 py-2">
          {message.content}
          {message.attachedImages && message.attachedImages.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {message.attachedImages.map((img, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={img}
                  alt={`Attached ${index + 1}`}
                  className="h-20 w-auto rounded border border-border object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    const errorLabel =
      message.errorType === "api"
        ? "API Error"
        : message.errorType === "validation"
          ? "Validation Error"
          : "Edit Failed";

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">{errorLabel}</span>
        </div>
        <div className="text-xs text-red-300/80 leading-relaxed pl-6">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-400">Assistant</span>
        <span className="text-xs text-muted-foreground-dim">{time}</span>
      </div>

      <div className="text-sm text-foreground leading-relaxed">
        {message.content}
        {metadata?.skills && metadata.skills.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1.5 align-middle cursor-help">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={4}>
              Skills used: {metadata.skills.join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {metadata?.editType === "tool_edit" && metadata.edits && (
        <div className="space-y-1.5 pl-1 mt-2">
          {metadata.edits.map((edit, i) => (
            <div key={i} className="flex items-center gap-2">
              <PenLine className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0 leading-none">
                <span className="text-xs text-muted-foreground">
                  {edit.description}
                </span>
                {edit.lineNumber && (
                  <span className="text-[10px] text-muted-foreground-dim font-mono ml-2">
                    L{edit.lineNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {metadata?.editType === "full_replacement" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCode className="w-3.5 h-3.5" />
          <span className="text-xs">Full code rewrite</span>
        </div>
      )}
    </div>
  );
}

function PendingMessage({ skills }: { skills?: string[] }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-400">Assistant</span>
        <span className="text-xs text-muted-foreground-dim">now</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-3 h-3 border-2 border-muted-foreground border-t-blue-400 rounded-full animate-spin" />
        <span>Generating...</span>
        {skills && skills.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex align-middle cursor-help">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={4}>
              Skills used: {skills.join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
