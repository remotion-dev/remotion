"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
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
  const [open, setOpen] = useState(false);

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
            Configure your animation settings.
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
