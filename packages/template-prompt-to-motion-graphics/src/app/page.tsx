"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUp,
  SquareArrowOutUpRight,
  Loader2,
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
import { examplePrompts } from "@/data/examplePrompts";
import { MODELS, type ModelId } from "@/components/PromptInput";
import { PageLayout } from "@/components/PageLayout";

const iconMap: Record<string, LucideIcon> = {
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
};

const Home: NextPage = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5.1:low");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsNavigating(true);
    const params = new URLSearchParams({ prompt, model });
    router.push(`/generate?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center flex-1 px-4">
        <h1 className="text-5xl font-bold text-white mb-10 text-center">
          What do you want to create?
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your animation..."
              className="w-full bg-transparent text-white placeholder:text-[#666] focus:outline-none resize-none overflow-y-auto text-base min-h-[60px] max-h-[200px]"
              style={{ fieldSizing: "content" } as React.CSSProperties}
              disabled={isNavigating}
            />

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#333]">
              <Select
                value={model}
                onValueChange={(value) => setModel(value as ModelId)}
                disabled={isNavigating}
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

              <button
                type="submit"
                disabled={isNavigating || !prompt.trim()}
                className="p-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isNavigating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
            <span className="text-[#666] text-xs mr-1">Prompt examples</span>
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
                  className="rounded-full bg-[#1a1a1a] border hover:brightness-125 transition-all flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {example.headline}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center mt-4">
            <Link
              href="/code-examples"
              className="text-[#555] hover:text-[#888] text-xs transition-colors flex items-center gap-1"
            >
              View Code examples
              <SquareArrowOutUpRight className="w-3 h-3" />
            </Link>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Home;
