"use client";

import { useState } from "react";
import {
  ArrowUp,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiKeyContext } from "@/context/ApiKeyContext";
import { examplePrompts } from "@/data/examplePrompts";

const iconMap: Record<string, LucideIcon> = {
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
};

export const MODELS = [
  { id: "gpt-5-mini", name: "GPT-5 Mini" },
  { id: "gpt-5.1-codex", name: "GPT-5.1 Codex" },
  { id: "gpt-5.1:none", name: "GPT-5.1 (No Reasoning)" },
  { id: "gpt-5.1:low", name: "GPT-5.1 (Low Reasoning)" },
  { id: "gpt-5.1:medium", name: "GPT-5.1 (Medium Reasoning)" },
  { id: "gpt-5.1:high", name: "GPT-5.1 (High Reasoning)" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating";

interface PromptInputProps {
  onCodeGenerated: (code: string) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  onStreamPhaseChange?: (phase: StreamPhase) => void;
  variant?: "landing" | "editor";
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
}

export function PromptInput({
  onCodeGenerated,
  onStreamingChange,
  onStreamPhaseChange,
  variant = "editor",
  prompt: controlledPrompt,
  onPromptChange,
}: PromptInputProps) {
  const { apiKey, hasApiKey, isLoaded } = useApiKeyContext();
  const [uncontrolledPrompt, setUncontrolledPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5.1:low");

  // Support both controlled and uncontrolled modes
  const prompt =
    controlledPrompt !== undefined ? controlledPrompt : uncontrolledPrompt;
  const setPrompt = onPromptChange || setUncontrolledPrompt;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || !hasApiKey) return;

    setIsLoading(true);
    onStreamingChange?.(true);
    onStreamPhaseChange?.("reasoning");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, apiKey }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
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

              onCodeGenerated(codeToShow.trim());
            }
          } catch {
            // Ignore parse errors for malformed JSON
          }
        }
      }
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setIsLoading(false);
      onStreamingChange?.(false);
      onStreamPhaseChange?.("idle");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isLanding = variant === "landing";

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
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your animation..."
            className={`w-full bg-transparent text-white placeholder:text-[#666] focus:outline-none resize-none overflow-y-auto ${
              isLanding
                ? "text-base min-h-[60px] max-h-[200px]"
                : "text-sm min-h-[40px] max-h-[150px]"
            }`}
            style={{ fieldSizing: "content" } as React.CSSProperties}
            disabled={isLoading}
          />

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#333]">
            <Select
              value={model}
              onValueChange={(value) => setModel(value as ModelId)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-auto bg-transparent border-none text-[#888] hover:text-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                {MODELS.map((m) => (
                  <SelectItem
                    key={m.id}
                    value={m.id}
                    className="text-white focus:bg-[#333] focus:text-white"
                  >
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    disabled={isLoading || !prompt.trim() || !hasApiKey}
                    className="p-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                {!hasApiKey && isLoaded && (
                  <TooltipContent>
                    <p>
                      Add your OpenAI API key in Settings to enable generation
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div
          className={`flex flex-wrap items-center gap-1.5 mt-3 ${
            isLanding ? "justify-center mt-6 gap-2" : ""
          }`}
        >
          <span className="text-[#666] text-xs mr-1">Try</span>
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
                className={`rounded-full bg-[#1a1a1a] border hover:brightness-125 transition-all flex items-center gap-1 px-1.5 py-0.5 text-[11px]`}
              >
                {Icon && <Icon className={isLanding ? "w-3 h-3" : "w-3 h-3"} />}
                {example.headline}
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}
