import { Caption } from "@remotion/captions";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Theme } from "../../../config/themes";
import { COLORS } from "../../../config/themes";
import {
  FIRST_COLUMN_WIDTH,
  SECOND_COLUMN_WIDTH,
  SIDE_PADDING,
} from "./layout";
import { useCaptionOverlay } from "./use-caption-overlay";

const Indent: React.FC<{ value: number; digits: number }> = ({
  digits,
  value,
}) => {
  const indentTo = digits - String(value).length;

  return (
    <span style={{ opacity: 0 }}>
      {new Array(indentTo)
        .fill(0)
        .map(() => "0")
        .join("")}
    </span>
  );
};

export const EditCaption: React.FC<{
  caption: Caption;
  longestNumberLength: number;
  index: number;
  onUpdateText: (index: number, newText: string) => void;
  isInitialCaption: boolean;
  trimStart: number;
  theme: Theme;
}> = ({
  caption,
  longestNumberLength,
  index,
  onUpdateText,
  isInitialCaption,
  trimStart,
  theme,
}) => {
  const overlay = useCaptionOverlay();
  const { width, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const milliSeconds = ((frame + trimStart) / fps) * 1000;
  const active =
    caption.startMs <= milliSeconds &&
    (caption.endMs === null || caption.endMs >= milliSeconds);
  const usableWidth = width - SIDE_PADDING * 2;
  const ref = useRef<HTMLDivElement>(null);

  const [initialFrame] = useState(() => frame);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateText(index, e.target.value);
    },
    [index, onUpdateText],
  );

  const isMonospaced =
    caption.text.trim().startsWith("`") && caption.text.trim().endsWith("`");

  const toggleMonospace = useCallback(() => {
    if (isMonospaced) {
      onUpdateText(index, caption.text.replace(/`/g, ""));
    } else {
      let newCaption = caption.text;
      if (!newCaption.trim().startsWith("`")) {
        newCaption = "`" + newCaption;
      }

      if (!newCaption.trim().endsWith("`") || newCaption.trim().length === 1) {
        newCaption += "`";
      }

      onUpdateText(index, newCaption);
    }
  }, [index, isMonospaced, onUpdateText, caption.text]);

  useEffect(() => {
    if (active && initialFrame !== frame) {
      ref.current?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [active, frame, initialFrame]);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = ref.current?.nextElementSibling?.querySelector(
          "input[type=text]",
        ) as HTMLInputElement | undefined;
        if (next) {
          next.focus();
          next.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = ref.current?.previousElementSibling?.querySelector(
          "input[type=text]",
        ) as HTMLInputElement | undefined;
        if (prev) {
          prev.focus();
          prev.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        overlay.setOpen(false);
      }

      const ctrlOrCommandKey = window.navigator.platform.startsWith("Mac")
        ? e.metaKey
        : e.ctrlKey;

      if (e.key === "i" && ctrlOrCommandKey) {
        e.preventDefault();
        toggleMonospace();
      }
    },
    [overlay, toggleMonospace],
  );

  return (
    <div
      ref={ref}
      style={{
        flexDirection: "row",
        display: "flex",
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: SIDE_PADDING,
        paddingRight: SIDE_PADDING,
        backgroundColor: active ? "rgba(0, 0, 0, 0.1)" : "transparent",
      }}
    >
      <div
        style={{
          fontFamily: "Helvetica",
          fontSize: 30,
          width: FIRST_COLUMN_WIDTH * usableWidth,
          fontVariantNumeric: "tabular-nums",
          color: "gray",
          textAlign: "right",
          paddingRight: 30,
        }}
      >
        <Indent value={caption.startMs} digits={longestNumberLength} />
        {String(caption.startMs)} :{" "}
        <Indent value={caption.endMs} digits={longestNumberLength} />
        {caption.endMs}
      </div>
      <div
        style={{
          width: SECOND_COLUMN_WIDTH * usableWidth,
          whiteSpace: "pre",
        }}
      >
        <input
          type="text"
          autoFocus={isInitialCaption}
          style={{
            fontSize: 30,
            fontFamily: isMonospaced ? "monospace" : "Helvetica",
            backgroundColor: "transparent",
            border: "none",
            color: isMonospaced ? COLORS[theme].ACCENT_COLOR : "black",
          }}
          value={caption.text}
          onKeyDown={onInputKeyDown}
          onChange={onChange}
        />
      </div>
      <div>
        <div
          style={{
            width: 30,
            height: 30,
            border: isMonospaced
              ? "2px solid " + COLORS[theme].ACCENT_COLOR
              : "2px solid gray",
            borderRadius: 3,
            cursor: "pointer",
            background: isMonospaced
              ? COLORS[theme].ACCENT_COLOR
              : "transparent",
          }}
          onClick={toggleMonospace}
        />
      </div>
    </div>
  );
};
