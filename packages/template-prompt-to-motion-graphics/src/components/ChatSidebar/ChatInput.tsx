"use client";

import { useState, type ComponentType, type DragEvent } from "react";
import { ArrowUp, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ModelId, MODELS } from "@/types/generation";
import { captureFrame, fileToBase64 } from "@/helpers/capture-frame";

interface ChatInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  isLoading: boolean;
  onSubmit: (attachedImage?: string) => void;
  // Frame capture props
  Component?: ComponentType | null;
  fps?: number;
  durationInFrames?: number;
  currentFrame?: number;
}

export function ChatInput({
  prompt,
  onPromptChange,
  model,
  onModelChange,
  isLoading,
  onSubmit,
  Component,
  fps = 30,
  durationInFrames = 150,
  currentFrame = 0,
}: ChatInputProps) {
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(attachedImage ?? undefined);
    setAttachedImage(null); // Clear after submit
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCapture = async () => {
    if (!Component || isCapturing) return;

    setIsCapturing(true);
    try {
      const base64 = await captureFrame(Component, currentFrame, {
        width: 1920,
        height: 1080,
        fps,
        durationInFrames,
      });
      setAttachedImage(base64);
    } catch (error) {
      console.error("Failed to capture frame:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const base64 = await fileToBase64(file);
          setAttachedImage(base64);
        }
        break;
      }
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
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const base64 = await fileToBase64(file);
        setAttachedImage(base64);
        break;
      }
    }
  };

  const canCapture = Component && !isLoading && !isCapturing;

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div
          className={`bg-background-elevated rounded-xl border p-3 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-500/10" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image preview */}
          {attachedImage && (
            <div className="mb-2 relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedImage}
                alt="Attached"
                className="h-16 w-auto rounded border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isDragging ? "Drop image here..." : "Tune your animation..."
            }
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

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={!canCapture}
                onClick={handleCapture}
                className="text-muted-foreground hover:text-foreground h-7 w-7"
                title="Capture current frame"
              >
                <Camera className="w-4 h-4" />
              </Button>

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
        </div>
      </form>
    </div>
  );
}
