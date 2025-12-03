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
        <button
          className="px-3 py-2 rounded border-none bg-[#1a1a1a] text-white text-sm font-medium cursor-pointer font-sans transition-colors hover:bg-[#2a2a2a] flex items-center gap-2 border border-[#333]"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
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
                      Math.max(1, Math.min(60, parseInt(e.target.value) || 30))
                    )
                  }
                  className="w-full px-3 py-2 rounded border border-[#333] bg-[#0f0f0f] text-white text-sm font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <p className="text-xs text-[#666]">
              Video length: {(durationInFrames / fps).toFixed(2)}s ({durationInFrames} frames / {fps} FPS)
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
              Your API key is stored locally in your browser and only sent to OpenAI for generation requests.
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
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded border-none bg-red-600 text-white text-sm font-medium cursor-pointer font-sans transition-colors hover:bg-red-700 mr-auto"
            >
              Clear Key
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded border border-[#333] bg-transparent text-white text-sm font-medium cursor-pointer font-sans transition-colors hover:bg-[#2a2a2a]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!inputValue.trim() || !isValidFormat}
              className="px-4 py-2 rounded border-none bg-indigo-500 text-white text-sm font-medium cursor-pointer font-sans transition-colors hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
