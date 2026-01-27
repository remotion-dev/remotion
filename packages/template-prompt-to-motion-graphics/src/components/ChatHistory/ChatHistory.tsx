"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  FileCode,
  AlertTriangle,
  PenLine,
  ArrowUp,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ConversationMessage,
  ConversationContextMessage,
  AssistantMetadata,
  ErrorCorrectionContext,
} from "@/types/conversation";
import {
  type StreamPhase,
  type GenerationErrorType,
  type ModelId,
  MODELS,
} from "../PromptInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  validateGptResponse,
  extractComponentCode,
} from "@/helpers/sanitize-response";

export interface ChatHistoryRef {
  triggerGeneration: (options?: { silent?: boolean }) => void;
}

interface ChatHistoryProps {
  messages: ConversationMessage[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasManualEdits: boolean;
  // PromptInput props for embedded chat input
  onCodeGenerated?: (code: string) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  onStreamPhaseChange?: (phase: StreamPhase) => void;
  onError?: (error: string, type: GenerationErrorType) => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  currentCode?: string;
  conversationHistory?: ConversationContextMessage[];
  /** Skills already used in this conversation (to avoid redundant skill content) */
  previouslyUsedSkills?: string[];
  isFollowUp?: boolean;
  onMessageSent?: (prompt: string) => void;
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
}

export const ChatHistory = forwardRef<ChatHistoryRef, ChatHistoryProps>(
  function ChatHistory(
    {
      messages,
      isCollapsed,
      onToggleCollapse,
      hasManualEdits,
      // PromptInput props
      onCodeGenerated,
      onStreamingChange,
      onStreamPhaseChange,
      onError,
      prompt: controlledPrompt,
      onPromptChange,
      currentCode,
      conversationHistory = [],
      previouslyUsedSkills = [],
      isFollowUp = false,
      onMessageSent,
      onGenerationComplete,
      onErrorMessage,
      errorCorrection,
    },
    ref,
  ) {
    const [uncontrolledPrompt, setUncontrolledPrompt] = useState("");
    const [model, setModel] = useState<ModelId>("gpt-5.2:low");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const prompt =
      controlledPrompt !== undefined ? controlledPrompt : uncontrolledPrompt;
    const setPrompt = onPromptChange || setUncontrolledPrompt;

    // Expose triggerGeneration via ref
    useImperativeHandle(ref, () => ({
      triggerGeneration: runGeneration,
    }));

    const runGeneration = async (options?: { silent?: boolean }) => {
      if (!prompt.trim() || isLoading) return;

      setIsLoading(true);
      onStreamingChange?.(true);
      onStreamPhaseChange?.("reasoning");
      // Only add user message if not a silent retry
      if (!options?.silent) {
        onMessageSent?.(prompt);
      }
      setPrompt(""); // Clear input immediately after sending

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            model,
            currentCode: isFollowUp ? currentCode : undefined,
            conversationHistory: isFollowUp ? conversationHistory : [],
            previouslyUsedSkills: isFollowUp ? previouslyUsedSkills : [],
            isFollowUp,
            hasManualEdits,
            errorCorrection,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `API error: ${response.status}`;
          if (errorData.type === "edit_failed") {
            onError?.(errorMessage, "validation");
            onErrorMessage?.(errorMessage, "edit_failed");
            return;
          }
          if (errorData.type === "validation") {
            onError?.(errorMessage, "validation");
            onErrorMessage?.(errorMessage, "validation");
            return;
          }
          throw new Error(errorMessage);
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          const { code, summary, metadata } = data;
          onCodeGenerated?.(code);
          onGenerationComplete?.(code, summary, metadata);
          const validation = validateGptResponse(code);
          if (!validation.isValid && validation.error) {
            onError?.(validation.error, "validation");
          }
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "reasoning-start") {
                onStreamPhaseChange?.("reasoning");
              } else if (event.type === "text-start") {
                onStreamPhaseChange?.("generating");
              } else if (event.type === "text-delta") {
                accumulatedText += event.delta;
                let codeToShow = accumulatedText;
                codeToShow = codeToShow.replace(/^```(?:tsx?|jsx?)?\n?/, "");
                codeToShow = codeToShow.replace(/\n?```\s*$/, "");
                onCodeGenerated?.(codeToShow.trim());
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch (parseError) {
              if (
                parseError instanceof Error &&
                parseError.message !== "Unexpected token"
              ) {
                throw parseError;
              }
            }
          }
        }

        let finalCode = accumulatedText;
        finalCode = finalCode.replace(/^```(?:tsx?|jsx?)?\n?/, "");
        finalCode = finalCode.replace(/\n?```\s*$/, "");
        finalCode = extractComponentCode(finalCode);
        onCodeGenerated?.(finalCode);
        onGenerationComplete?.(finalCode);

        const validation = validateGptResponse(finalCode);
        if (!validation.isValid && validation.error) {
          onError?.(validation.error, "validation");
        }
      } catch (error) {
        console.error("Error generating code:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        onError?.(errorMessage, "api");
      } finally {
        setIsLoading(false);
        onStreamingChange?.(false);
        onStreamPhaseChange?.("idle");
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;
      await runGeneration();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col bg-background transition-all duration-300 shrink-0",
          isCollapsed ? "w-12" : "w-[420px]",
        )}
      >
        {/* Header */}
        {!isCollapsed && (
          <div className="flex items-start justify-between px-4 mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Assistant Chat
            </h2>
            <div className="flex items-center gap-1 -mt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm("Start over? This will reset your animation.")) {
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
        )}
        {isCollapsed && (
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
        )}

        {/* Messages - clean timeline style */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input - Lovable style */}
        {!isCollapsed && (
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="bg-background-elevated rounded-xl border border-border p-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tune your animation..."
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none text-sm min-h-[36px] max-h-[120px]"
                  style={{ fieldSizing: "content" }}
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                  <Select
                    value={model}
                    onValueChange={(value) => setModel(value as ModelId)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-auto bg-transparent border-none text-muted-foreground hover:text-foreground transition-colors text-xs h-7 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background-elevated border-border">
                      {MODELS.map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id}
                          className="text-foreground focus:bg-secondary focus:text-foreground text-xs"
                        >
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={!prompt.trim() || isLoading}
                    loading={isLoading}
                    className="bg-foreground text-background hover:bg-gray-200 h-7 w-7"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  },
);

function ChatMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const metadata = message.metadata;

  // Format time
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  // User messages
  if (isUser) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">You</span>
          <span className="text-xs text-muted-foreground-dim">{time}</span>
        </div>
        <div className="text-sm text-foreground leading-relaxed bg-secondary/50 rounded-lg px-3 py-2">
          {message.content}
        </div>
      </div>
    );
  }

  // Error messages
  if (isError) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">Edit Failed</span>
        </div>
        <div className="text-xs text-red-300/80 leading-relaxed pl-6">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant messages - show summary + inline edits
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-400">Assistant</span>
        <span className="text-xs text-muted-foreground-dim">{time}</span>
      </div>

      {/* Summary with optional skills icon */}
      <div className="text-sm text-foreground leading-relaxed">
        {message.content}
        {metadata?.skills && metadata.skills.length > 0 && (
          <span className="relative inline-flex ml-1.5 group align-middle">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-background-elevated border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <span className="text-[10px] text-muted-foreground">
                Skills: {metadata.skills.join(", ")}
              </span>
            </div>
          </span>
        )}
      </div>

      {/* Edits - clean list */}
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

      {/* Full replacement */}
      {metadata?.editType === "full_replacement" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCode className="w-3.5 h-3.5" />
          <span className="text-xs">Full code rewrite</span>
        </div>
      )}
    </div>
  );
}
