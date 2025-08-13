import { Caption } from "@remotion/captions";
import React, { useCallback, useMemo, useState } from "react";
import {
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MONOSPACE_FONT, REGULAR_FONT } from "../../../../config/fonts";
import type { Theme } from "../../../../config/themes";
import { COLORS } from "../../../../config/themes";
import { useCaptionOverlay } from "../../editor/use-caption-overlay";
import {
  isCaptionMonospace,
  removeMonospaceTicks,
} from "../../processing/split-caption-into-monospace-segments";

type CaptionColor = {
  appeared: string;
  greyed: string;
};

const WORD_FADE_IN_DURATION_IN_MS = 100;

const getShownCaptionColor = ({
  appeared,
  caption,
  time,
  captionColor,
  active,
}: {
  appeared: boolean;
  caption: Caption;
  time: number;
  captionColor: CaptionColor;
  active: boolean;
}) => {
  if (!appeared) {
    return captionColor.greyed;
  }

  if (isCaptionMonospace(caption)) {
    if (active) {
      return "white";
    }

    return captionColor.appeared;
  }

  return interpolateColors(
    time,
    [caption.startMs - WORD_FADE_IN_DURATION_IN_MS, caption.startMs],
    [captionColor.greyed, captionColor.appeared],
  );
};

const getCaptionColor = ({
  appeared,
  monospace,
  theme,
}: {
  monospace: boolean;
  appeared: boolean;
  theme: Theme;
}): { appeared: string; greyed: string } => {
  const normalCaptionColor = {
    appeared: COLORS[theme].WORD_COLOR_ON_BG_APPEARED,
    greyed: COLORS[theme].WORD_COLOR_ON_BG_GREYED,
  };

  return monospace && appeared
    ? {
        appeared: COLORS[theme].ACCENT_COLOR,
        greyed: COLORS[theme].WORD_COLOR_ON_BG_GREYED,
      }
    : normalCaptionColor;
};

const WORD_HIGHLIGHT_BORDER_RADIUS = 10;

export const BoxedSingleCaption: React.FC<{
  caption: Caption;
  isLast: boolean;
  theme: Theme;
  startFrame: number;
}> = ({ caption, isLast, theme, startFrame }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame() + startFrame;
  const time = (frame / fps) * 1000;

  const [hovered, setHovered] = useState(false);

  const monospace = isCaptionMonospace(caption);

  const progress = monospace
    ? caption.startMs > time
      ? 1
      : spring({
          fps,
          frame,
          delay:
            caption.startMs * fps - (WORD_FADE_IN_DURATION_IN_MS / 1000) * fps,
          config: {
            damping: 200,
          },
          durationInFrames: 5,
        }) *
          0.05 +
        0.95
    : 1;

  const appeared = caption.startMs - 100 <= time;

  const active =
    appeared &&
    (caption.endMs === null || caption.endMs - 100 > time || isLast);

  const captionColor = getCaptionColor({
    appeared,
    monospace,
    theme,
  });

  const shownCaptionColor = getShownCaptionColor({
    appeared,
    time,
    caption,
    captionColor,
    active,
  });

  const shouldHighlight = active && monospace;

  const backgroundColor = shouldHighlight
    ? COLORS[theme].ACCENT_COLOR
    : "transparent";

  const style: React.CSSProperties = useMemo(() => {
    return {
      display: "inline",
      color: shownCaptionColor,
      ...(monospace ? MONOSPACE_FONT : REGULAR_FONT),
      backgroundColor,
      outline: hovered
        ? "2px solid black"
        : active
          ? "5px solid " + backgroundColor
          : "none",
      whiteSpace: monospace ? "nowrap" : undefined,
      // Fix gap inbetween background and outline
      boxShadow: shouldHighlight ? `0 0 0 1px ${backgroundColor}` : "none",
      borderRadius: WORD_HIGHLIGHT_BORDER_RADIUS,
      scale: String(progress),
      cursor: "pointer",
    };
  }, [
    active,
    backgroundColor,
    hovered,
    monospace,
    progress,
    shouldHighlight,
    shownCaptionColor,
  ]);

  const onPointerEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const overlay = useCaptionOverlay();

  const onClick = useCallback(() => {
    overlay.setOpen(caption);
  }, [overlay, caption]);

  const actualText = removeMonospaceTicks(caption).text;

  return (
    <span
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      {actualText}
    </span>
  );
};
