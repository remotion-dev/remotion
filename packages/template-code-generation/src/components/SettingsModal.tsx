"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useApiKeyContext } from "@/context/ApiKeyContext";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  durationInFrames: number;
  onDurationChange: (duration: number) => void;
  fps: number;
  onFpsChange: (fps: number) => void;
}

export function SettingsModal({
  durationInFrames,
  onDurationChange,
  fps,
  onFpsChange,
}: SettingsModalProps) {
  const { apiKey, setApiKey, clearApiKey, hasApiKey } = useApiKeyContext();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Sync input with stored key when modal opens
  useEffect(() => {
    if (open) {
      setInputValue(apiKey);
      setShowKey(false);
    }
  }, [open, apiKey]);

  const handleSave = () => {
    setApiKey(inputValue.trim());
    setOpen(false);
  };

  const handleClear = () => {
    clearApiKey();
    setInputValue("");
  };

  const isValidFormat = inputValue.startsWith("sk-") && inputValue.length > 20;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="text-[#888]">
            Configure your animation and API settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-white">Animation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration" className="text-[#888] text-sm">
                  Duration (frames)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={1000}
                  value={durationInFrames}
                  onChange={(e) =>
                    onDurationChange(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full px-3 py-2 rounded border border-[#333] bg-[#0f0f0f] text-white text-sm font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="fps" className="text-[#888] text-sm">
                  FPS
                </label>
                <input
                  id="fps"
                  type="number"
                  min={1}
                  max={60}
                  value={fps}
                  onChange={(e) =>
                    onFpsChange(
                      Math.max(1, Math.min(60, parseInt(e.target.value) || 30)),
                    )
                  }
                  className="w-full px-3 py-2 rounded border border-[#333] bg-[#0f0f0f] text-white text-sm font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <p className="text-xs text-[#666]">
              Video length: {(durationInFrames / fps).toFixed(2)}s (
              {durationInFrames} frames / {fps} FPS)
            </p>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-medium text-white">API</h3>
            <label htmlFor="api-key" className="text-[#888] text-sm">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 rounded border border-[#333] bg-[#0f0f0f] text-white text-sm font-sans placeholder:text-[#666] focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] hover:text-white bg-transparent border-none cursor-pointer"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {inputValue && !isValidFormat && (
              <p className="text-sm text-red-400">
                API key should start with &quot;sk-&quot;
              </p>
            )}
            <p className="text-xs text-[#666]">
              Your API key is stored locally in your browser and only sent to
              OpenAI for generation requests.
            </p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 w-fit"
            >
              Get your API key from OpenAI
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-between">
          {hasApiKey && (
            <Button
              onClick={handleClear}
              variant="destructive"
              className="mr-auto"
            >
              Clear Key
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!inputValue.trim() || !isValidFormat}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
