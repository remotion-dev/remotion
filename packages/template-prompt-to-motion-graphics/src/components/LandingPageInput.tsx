"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowUp,
  SquareArrowOutUpRight,
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
  X,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import { fileToBase64 } from "@/helpers/capture-frame";
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

const MAX_ATTACHED_IMAGES = 4;

interface LandingPageInputProps {
  onNavigate: (prompt: string, model: ModelId, attachedImages?: string[]) => void;
  isNavigating?: boolean;
  showCodeExamplesLink?: boolean;
}

export function LandingPageInput({
  onNavigate,
  isNavigating = false,
  showCodeExamplesLink = false,
}: LandingPageInputProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5.2:low");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isNavigating) return;
    onNavigate(prompt, model, attachedImages.length > 0 ? attachedImages : undefined);
  };

  const addImages = (newImages: string[]) => {
    setAttachedImages((prev) => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, MAX_ATTACHED_IMAGES);
    });
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    addImages(base64Images);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length > 0) {
      e.preventDefault();
      const files = imageItems
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      const base64Images = await Promise.all(files.map(fileToBase64));
      addImages(base64Images);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    addImages(base64Images);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <h1 className="text-5xl font-bold text-white mb-10 text-center">
        What do you want to create?
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div
          className={`bg-background-elevated rounded-xl border p-4 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-500/10" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image previews */}
          {attachedImages.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 pt-2">
              {attachedImages.map((img, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Attached ${index + 1}`}
                    className="h-20 w-auto rounded border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isDragging ? "Drop images here..." : "Describe your animation... (paste or drop images)"}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none overflow-y-auto text-base min-h-[60px] max-h-[200px]"
            style={{ fieldSizing: "content" }}
            disabled={isNavigating}
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
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

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isNavigating || attachedImages.length >= MAX_ATTACHED_IMAGES}
                className="text-muted-foreground hover:text-foreground"
                title="Attach images"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

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
        </div>

        <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
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
