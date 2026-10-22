"use client";

import {
  BracketsIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  Grid2x2Icon,
  HandIcon,
  MaximizeIcon,
  MousePointer2Icon,
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  StepBackIcon,
  StepForwardIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePlaybackFrame, usePlaybackValue } from "../hooks/use-playback";
import { formatTimecode } from "../model/values";
import { useEditor } from "../state/editor-context";
import { ToolbarButton } from "./TopBar";

const FrameInput: React.FC = () => {
  const { playback, actions, composition } = useEditor();
  const frame = usePlaybackFrame(playback);
  const [draft, setDraft] = useState<string | null>(null);
  const fps = composition?.fps ?? 30;
  const duration = composition?.durationInFrames ?? 1;

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px]">
      <input
        data-frame-input
        aria-label="Current frame"
        className="bg-input border-border focus-visible:border-ring h-6 w-14 rounded border px-1.5 text-right tabular-nums outline-none"
        value={draft ?? String(frame)}
        onFocus={(event) => {
          setDraft(String(frame));
          event.target.select();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== null && draft.trim() !== "") {
            actions.seek(Number(draft));
          }

          setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
      />
      <span className="text-muted-foreground tabular-nums">
        {formatTimecode(frame, fps)}
      </span>
      <span className="text-muted-foreground-dim">/</span>
      <span className="text-muted-foreground-dim tabular-nums">
        {formatTimecode(Math.max(0, duration - 1), fps)}
      </span>
    </div>
  );
};

const PlayButton: React.FC = () => {
  const { playback, actions } = useEditor();
  const playing = usePlaybackValue(playback, (snapshot) => snapshot.playing);
  const hasPlayer = usePlaybackValue(
    playback,
    (snapshot) => snapshot.hasPlayer,
  );

  return (
    <ToolbarButton
      label={playing ? "Pause" : "Play"}
      shortcut="Space"
      onClick={actions.togglePlayback}
      disabled={!hasPlayer}
      className="bg-accent/60 hover:bg-accent text-foreground"
    >
      {playing ? (
        <PauseIcon className="fill-current" />
      ) : (
        <PlayIcon className="fill-current" />
      )}
    </ToolbarButton>
  );
};

const MuteButton: React.FC = () => {
  const { playback, actions } = useEditor();
  const muted = usePlaybackValue(playback, (snapshot) => snapshot.muted);
  const volume = usePlaybackValue(playback, (snapshot) => snapshot.volume);
  const [hover, setHover] = useState(false);

  return (
    <div
      className="flex items-center"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <ToolbarButton
        label={muted ? "Unmute" : "Mute"}
        shortcut="M"
        onClick={actions.toggleMute}
      >
        {muted || volume === 0 ? <VolumeXIcon /> : <Volume2Icon />}
      </ToolbarButton>
      <input
        type="range"
        aria-label="Volume"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        onChange={(event) => actions.setVolume(Number(event.target.value))}
        className={cn(
          "accent-primary h-1 transition-all",
          hover ? "w-16 opacity-100" : "w-0 opacity-0",
        )}
      />
    </div>
  );
};

export const Transport: React.FC = () => {
  const { state, actions, composition, playback } = useEditor();
  const { playback: settings } = state;
  const hasPlayer = usePlaybackValue(
    playback,
    (snapshot) => snapshot.hasPlayer,
  );
  const [scale, setScale] = useState<number | null>(null);

  // Show the effective zoom while in "fit" mode.
  useEffect(() => {
    const player = playback.getPlayer();
    if (settings.zoom !== "fit" || !player) {
      setScale(null);
      return;
    }

    setScale(Math.round(player.getScale() * 100));
    const onScale = (event: { detail: { scale: number } }) =>
      setScale(Math.round(event.detail.scale * 100));
    player.addEventListener("scalechange", onScale);
    return () => player.removeEventListener("scalechange", onScale);
  }, [hasPlayer, playback, settings.zoom, composition]);

  const zoomValue = settings.zoom === "fit" ? "fit" : String(settings.zoom);
  const zoomLabel =
    settings.zoom === "fit"
      ? scale === null
        ? "Fit"
        : `Fit · ${scale}%`
      : `${Math.round(settings.zoom * 100)}%`;

  return (
    <div className="border-border bg-background-elevated flex h-10 shrink-0 items-center gap-1 border-t px-2">
      <ToolbarButton
        label="Jump to start"
        shortcut="A"
        onClick={actions.seekToStart}
        disabled={!hasPlayer}
      >
        <ChevronFirstIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Previous frame"
        shortcut="←"
        onClick={() => actions.step(-1)}
        disabled={!hasPlayer}
      >
        <StepBackIcon />
      </ToolbarButton>
      <PlayButton />
      <ToolbarButton
        label="Next frame"
        shortcut="→"
        onClick={() => actions.step(1)}
        disabled={!hasPlayer}
      >
        <StepForwardIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Jump to end"
        shortcut="E"
        onClick={actions.seekToEnd}
        disabled={!hasPlayer}
      >
        <ChevronLastIcon />
      </ToolbarButton>
      <div className="bg-border mx-1 h-5 w-px" />
      <FrameInput />
      <div className="bg-border mx-1 h-5 w-px" />
      <ToolbarButton
        label="Set in point"
        shortcut="I"
        onClick={actions.setInPoint}
        pressed={settings.inFrame !== null}
      >
        <BracketsIcon className="[&>path:last-child]:opacity-30" />
      </ToolbarButton>
      <ToolbarButton
        label="Set out point"
        shortcut="O"
        onClick={actions.setOutPoint}
        pressed={settings.outFrame !== null}
      >
        <BracketsIcon className="[&>path:first-child]:opacity-30" />
      </ToolbarButton>
      {settings.inFrame !== null || settings.outFrame !== null ? (
        <ToolbarButton
          label="Clear in / out"
          shortcut="X"
          onClick={actions.clearInOut}
          size="icon-xs"
        >
          <XIcon />
        </ToolbarButton>
      ) : null}
      <ToolbarButton
        label={settings.loop ? "Looping" : "Loop"}
        shortcut="⇧L"
        onClick={actions.toggleLoop}
        pressed={settings.loop}
      >
        <Repeat2Icon />
      </ToolbarButton>
      <Select
        value={String(settings.playbackRate)}
        onValueChange={(value) => actions.setPlaybackRate(Number(value))}
      >
        <SelectTrigger
          size="sm"
          aria-label="Playback rate"
          className="w-[62px] border-transparent bg-transparent font-mono text-[11px] hover:bg-accent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[0.25, 0.5, 1, 1.5, 2, 4].map((rate) => (
            <SelectItem key={rate} value={String(rate)}>
              {rate}×
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <MuteButton />
      <div className="flex-1" />
      <ToolbarButton
        label={
          settings.showOutlines
            ? "Select mode: click layers to select them"
            : "Interact mode: use the composition's own UI"
        }
        shortcut="⇧O"
        onClick={actions.toggleOutlines}
        pressed={settings.showOutlines}
      >
        {settings.showOutlines ? <MousePointer2Icon /> : <HandIcon />}
      </ToolbarButton>
      <ToolbarButton
        label="Checkerboard background"
        shortcut="T"
        onClick={actions.toggleCheckerboard}
        pressed={settings.checkerboard}
      >
        <Grid2x2Icon />
      </ToolbarButton>
      <div className="bg-border mx-1 h-5 w-px" />
      <ToolbarButton label="Zoom out" shortcut="−" onClick={actions.zoomOut}>
        <ZoomOutIcon />
      </ToolbarButton>
      <Select
        value={zoomValue}
        onValueChange={(value) =>
          actions.setZoom(value === "fit" ? "fit" : Number(value))
        }
      >
        <SelectTrigger
          size="sm"
          aria-label="Zoom"
          className="w-[92px] border-transparent bg-transparent font-mono text-[11px] hover:bg-accent"
        >
          <span className="truncate">{zoomLabel}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fit">Fit</SelectItem>
          {[0.25, 0.5, 0.75, 1, 1.5, 2, 3].map((zoom) => (
            <SelectItem key={zoom} value={String(zoom)}>
              {Math.round(zoom * 100)}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToolbarButton label="Zoom in" shortcut="+" onClick={actions.zoomIn}>
        <ZoomInIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Fullscreen"
        shortcut="F"
        onClick={actions.toggleFullscreen}
        disabled={!hasPlayer}
      >
        <MaximizeIcon />
      </ToolbarButton>
    </div>
  );
};
