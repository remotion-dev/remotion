"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ModelId, MODELS } from "@/types/generation";

interface ChatInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function ChatInput({
  prompt,
  onPromptChange,
  model,
  onModelChange,
  isLoading,
  onSubmit,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="bg-background-elevated rounded-xl border border-border p-3">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tune your animation..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none text-sm min-h-[36px] max-h-[120px]"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
            <Select
              value={model}
              onValueChange={(value) => onModelChange(value as ModelId)}
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
  );
}
