"use client";

import { useState } from "react";
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
import { type ModelId, MODELS } from "@/types/generation";

const iconMap: Record<string, LucideIcon> = {
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
};

interface LandingPageInputProps {
  onNavigate: (prompt: string, model: ModelId) => void;
  isNavigating?: boolean;
  showCodeExamplesLink?: boolean;
}

export function LandingPageInput({
  onNavigate,
  isNavigating = false,
  showCodeExamplesLink = false,
}: LandingPageInputProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5.2:medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isNavigating) return;
    onNavigate(prompt, model);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <h1 className="text-5xl font-bold text-white mb-10 text-center">
        What do you want to create?
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div className="bg-background-elevated rounded-xl border border-border p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your animation..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none overflow-y-auto text-base min-h-[60px] max-h-[200px]"
            style={{ fieldSizing: "content" }}
            disabled={isNavigating}
          />

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
            <Select
              value={model}
              onValueChange={(value) => setModel(value as ModelId)}
              disabled={isNavigating}
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
              disabled={!prompt.trim() || isNavigating}
              loading={isNavigating}
              className="bg-foreground text-background hover:bg-gray-200"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3 justify-center mt-6 gap-2">
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
                className="rounded-full bg-background-elevated border hover:brightness-125 transition-all flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
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
}
