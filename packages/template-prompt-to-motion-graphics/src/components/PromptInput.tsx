"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import {
  ArrowUp,
  SquareArrowOutUpRight,
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { examplePrompts } from "@/examples/prompts";
import {
  validateGptResponse,
  extractComponentCode,
} from "@/helpers/sanitize-response";

const iconMap: Record<string, LucideIcon> = {
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
};

export const MODELS = [
  { id: "gpt-5.2:none", name: "GPT-5.2 (No Reasoning)" },
  { id: "gpt-5.2:low", name: "GPT-5.2 (Low Reasoning)" },
  { id: "gpt-5.2:medium", name: "GPT-5.2 (Medium Reasoning)" },
  { id: "gpt-5.2:high", name: "GPT-5.2 (High Reasoning)" },
  { id: "gpt-5.2-pro:medium", name: "GPT-5.2 Pro (Medium)" },
  { id: "gpt-5.2-pro:high", name: "GPT-5.2 Pro (High)" },
  { id: "gpt-5.2-pro:xhigh", name: "GPT-5.2 Pro (XHigh)" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating";

export type GenerationErrorType = "validation" | "api";

export interface PromptInputRef {
  triggerGeneration: () => void;
}

interface PromptInputProps {
  onCodeGenerated?: (code: string) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  onStreamPhaseChange?: (phase: StreamPhase) => void;
  onError?: (error: string, type: GenerationErrorType) => void;
  variant?: "landing" | "editor";
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  /** Called when landing variant submits - receives prompt and model for navigation */
  onNavigate?: (prompt: string, model: ModelId) => void;
  /** Whether navigation is in progress (for landing variant) */
  isNavigating?: boolean;
  /** Whether to show the "View Code examples" link (landing variant) */
  showCodeExamplesLink?: boolean;
}

export const PromptInput = forwardRef<PromptInputRef, PromptInputProps>(
  function PromptInput(
    {
      onCodeGenerated,
      onStreamingChange,
      onStreamPhaseChange,
      onError,
      variant = "editor",
      prompt: controlledPrompt,
      onPromptChange,
      onNavigate,
      isNavigating = false,
      showCodeExamplesLink = false,
    },
    ref,
  ) {
    const [uncontrolledPrompt, setUncontrolledPrompt] = useState("");
    const [model, setModel] = useState<ModelId>("gpt-5.2:low");

    // Support both controlled and uncontrolled modes
    const prompt =
      controlledPrompt !== undefined ? controlledPrompt : uncontrolledPrompt;
    const setPrompt = onPromptChange || setUncontrolledPrompt;
    const [isLoading, setIsLoading] = useState(false);

    const runGeneration = async () => {
      if (!prompt.trim() || isLoading) return;

      setIsLoading(true);
      onStreamingChange?.(true);
      onStreamPhaseChange?.("reasoning");
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `API error: ${response.status}`;
          // Check if this is a validation error from the API
          if (errorData.type === "validation") {
            onError?.(errorMessage, "validation");
            return;
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let accumulatedText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from the buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6); // Remove "data: " prefix

            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);

              // Track phase changes
              if (event.type === "reasoning-start") {
                onStreamPhaseChange?.("reasoning");
              } else if (event.type === "text-start") {
                onStreamPhaseChange?.("generating");
              } else if (event.type === "text-delta") {
                accumulatedText += event.delta;

                // Strip markdown code block markers and show raw code during streaming
                let codeToShow = accumulatedText;
                codeToShow = codeToShow.replace(/^```(?:tsx?|jsx?)?\n?/, "");
                codeToShow = codeToShow.replace(/\n?```\s*$/, "");

                onCodeGenerated?.(codeToShow.trim());
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch (parseError) {
              // Only re-throw if it's an actual Error we created, not a JSON parse error
              if (parseError instanceof Error && parseError.message !== "Unexpected token") {
                throw parseError;
              }
            }
          }
        }

        // Sanitize the final response (strip markdown code block wrappers and trailing text)
        let finalCode = accumulatedText;
        finalCode = finalCode.replace(/^```(?:tsx?|jsx?)?\n?/, "");
        finalCode = finalCode.replace(/\n?```\s*$/, "");
        finalCode = extractComponentCode(finalCode);

        // Update the editor with the cleaned code
        onCodeGenerated?.(finalCode);

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

    // Expose triggerGeneration via ref
    useImperativeHandle(ref, () => ({
      triggerGeneration: runGeneration,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;

      // Landing variant uses navigation instead of API call
      if (isLanding && onNavigate) {
        onNavigate(prompt, model);
        return;
      }

      await runGeneration();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    const isLanding = variant === "landing";
    const isDisabled = isLanding ? isNavigating : isLoading;

    return (
      <div
        className={
          isLanding
            ? "flex flex-col items-center justify-center flex-1 px-4"
            : "flex flex-col gap-2"
        }
      >
        {isLanding && (
          <h1 className="text-5xl font-bold text-white mb-10 text-center">
            What do you want to create?
          </h1>
        )}

        <form
          onSubmit={handleSubmit}
          className={isLanding ? "w-full max-w-3xl" : ""}
        >
          <div className="bg-background-elevated rounded-xl border border-border p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your animation..."
              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none overflow-y-auto ${
                isLanding
                  ? "text-base min-h-[60px] max-h-[200px]"
                  : "text-sm min-h-[40px] max-h-[150px]"
              }`}
              style={{ fieldSizing: "content" }}
              disabled={isDisabled}
            />

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
              <Select
                value={model}
                onValueChange={(value) => setModel(value as ModelId)}
                disabled={isDisabled}
              >
                <SelectTrigger className="w-auto bg-transparent border-none text-muted-foreground hover:text-foreground transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background-elevated border-border">
                  {MODELS.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="text-foreground focus:bg-secondary focus:text-foreground"
                    >
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="submit"
                size="icon-sm"
                disabled={!prompt.trim() || isDisabled}
                loading={isDisabled}
                className="bg-foreground text-background hover:bg-gray-200"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            className={`flex flex-wrap items-center gap-1.5 mt-3 ${
              isLanding ? "justify-center mt-6 gap-2" : ""
            }`}
          >
            <span className="text-muted-foreground-dim text-xs mr-1">
              Prompt Examples
            </span>
            {examplePrompts.map((example) => {
              const Icon = iconMap[example.icon];
              return (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => setPrompt(example.prompt)}
                  style={{
                    borderColor: `${example.color}40`,
                    color: example.color,
                  }}
                  className={`rounded-full bg-background-elevated border hover:brightness-125 transition-all flex items-center gap-1 px-1.5 py-0.5 text-[11px]`}
                >
                  <Icon className="w-3 h-3" />
                  {example.headline}
                </button>
              );
            })}
          </div>

          {showCodeExamplesLink && (
            <div className="flex justify-center mt-4">
              <Link
                href="/code-examples"
                className="text-muted-foreground-dim hover:text-muted-foreground text-xs transition-colors flex items-center gap-1"
              >
                View Code examples
                <SquareArrowOutUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </form>
      </div>
    );
  },
);
