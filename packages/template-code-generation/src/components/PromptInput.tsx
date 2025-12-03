"use client";

import { useState } from "react";
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

const MODELS = [
  { id: "gpt-5-mini", name: "GPT-5 Mini" },
  { id: "gpt-5.1-codex", name: "GPT-5.1 Codex" },
  { id: "gpt-5.1-codex-mini", name: "GPT-5.1 Codex Mini" },
  { id: "gpt-5.1", name: "GPT-5.1" },
] as const;

type ModelId = (typeof MODELS)[number]["id"];

interface PromptInputProps {
  onCodeGenerated: (code: string) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
}

export function PromptInput({
  onCodeGenerated,
  onStreamingChange,
}: PromptInputProps) {
  const { apiKey, hasApiKey, isLoaded } = useApiKeyContext();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5-mini");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || !hasApiKey) return;

    setIsLoading(true);
    onStreamingChange?.(true);
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        // Strip markdown code block markers and show raw code during streaming
        let codeToShow = accumulatedText;

        // Remove opening code fence (```tsx, ```jsx, ```, etc.)
        codeToShow = codeToShow.replace(/^```(?:tsx?|jsx?)?\n?/, "");
        // Remove closing code fence if present
        codeToShow = codeToShow.replace(/\n?```\s*$/, "");

        onCodeGenerated(codeToShow.trim());
      }
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setIsLoading(false);
      onStreamingChange?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-[#888]">Prompt</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-4 bg-[#1a1a1a] rounded-md"
      >
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your animation... (e.g., 'A bouncing ball')"
            className="flex-1 px-4 py-2 rounded-lg border border-[#333] bg-[#0f0f0f] text-white text-sm font-sans placeholder:text-[#666] focus:outline-none focus:border-[#555] resize-none min-h-[4.5rem] max-h-[200px] overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Select
              value={model}
              onValueChange={(value) => setModel(value as ModelId)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[160px] bg-[#0f0f0f] border-[#333] text-white">
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
                  <div className="w-full">
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim() || !hasApiKey}
                      className="w-full px-4 py-2 rounded border-none bg-indigo-500 text-white text-sm font-medium cursor-pointer font-sans transition-colors hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
                    >
                      {isLoading ? (
                        "Generating..."
                      ) : (
                        <>
                          <span>Generate</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-indigo-200/70">
                            <kbd className="px-0.5 bg-indigo-600/40 rounded font-mono">
                              ⌘
                            </kbd>
                            <span>+</span>
                            <kbd className="px-0.5 bg-indigo-600/40 rounded font-mono">
                              Enter
                            </kbd>
                          </span>
                        </>
                      )}
                    </button>
                  </div>
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#666]">Try these:</span>
          {examplePrompts.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => setPrompt(example.prompt)}
              style={{
                borderColor: `${example.color}40`,
                color: example.color,
              }}
              className="px-2 py-1 text-xs rounded-full bg-[#252525] border hover:brightness-125 transition-all"
            >
              {example.headline}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
