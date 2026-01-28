import { RemotionExample } from "./index";

export const typewriterHighlightCode = `import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

export const MyAnimation = () => {
  /*
   * A centered "Hello world" appears with a left-to-right typewriter reveal and a smoothly blinking caret.
   * After the phrase finishes typing, the word "world" crossfades into a final state with a yellow highlight behind it.
   */
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const COLOR_BG = "#FFFFFF";
  const COLOR_TEXT = "#000000";
  const COLOR_HIGHLIGHT = "#FFE44D";

  const FULL_TEXT = "Hello world";
  const HIGHLIGHT_WORD = "world";
  const CARET_SYMBOL = "▌";

  const FONT_SIZE = Math.max(56, Math.round(width * 0.075));
  const FONT_WEIGHT = 800;
  const LINE_HEIGHT = 1.05;
  const LETTER_SPACING = -0.6;

  const PADDING = Math.max(40, Math.round(width * 0.06));

  const CHAR_FRAMES = 3;
  const CURSOR_BLINK_FRAMES = 16;

  const ENTRANCE_DURATION = 22;

  const HIGHLIGHT_DELAY = 10;
  const HIGHLIGHT_SPRING_DURATION = 22;
  const CROSSFADE_DURATION = 10;

  const entranceProgress = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 140, mass: 0.9 },
    durationInFrames: ENTRANCE_DURATION,
  });

  const containerOpacity = interpolate(entranceProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const containerTranslateX = interpolate(entranceProgress, [0, 1], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const typedChars = Math.min(
    FULL_TEXT.length,
    Math.floor(frame / CHAR_FRAMES),
  );
  const typedText = FULL_TEXT.slice(0, typedChars);
  const typingDone = typedChars >= FULL_TEXT.length;

  const caretOpacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const typeEndFrame = FULL_TEXT.length * CHAR_FRAMES;
  const highlightStart = typeEndFrame + HIGHLIGHT_DELAY;

  const typedLayerOpacity = 1;

  const finalLayerOpacity = frame >= highlightStart ? 1 : 0;

  const highlightWordIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
  const hasHighlight = highlightWordIndex >= 0;

  const preText = hasHighlight ? FULL_TEXT.slice(0, highlightWordIndex) : "";
  const postText = hasHighlight
    ? FULL_TEXT.slice(highlightWordIndex + HIGHLIGHT_WORD.length)
    : "";

  const highlightProgress = spring({
    fps,
    frame: frame - highlightStart,
    config: { damping: 22, stiffness: 180, mass: 0.9 },
    durationInFrames: HIGHLIGHT_SPRING_DURATION,
  });

  const highlightScaleX = interpolate(highlightProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightOpacity = interpolate(highlightProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        fontFamily: "Inter, sans-serif",
        padding: PADDING,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          opacity: containerOpacity,
          transform: \`translateX(\${containerTranslateX}px)\`,
        }}
      >
        {/* Typewriter layer */}
        <div
          style={{
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: LINE_HEIGHT,
            letterSpacing: LETTER_SPACING,
            whiteSpace: "pre",
            opacity: typedLayerOpacity,
          }}
        >
          <span>{typedText}</span>
          {!typingDone && (
            <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
          )}
        </div>

        {/* Final highlighted layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: LINE_HEIGHT,
            letterSpacing: LETTER_SPACING,
            whiteSpace: "pre",
            opacity: finalLayerOpacity,
          }}
        >
          {hasHighlight ? (
            <>
              <span>{preText}</span>
              <span style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-0.12em",
                    right: "-0.12em",
                    top: "50%",
                    height: "1.05em",
                    transform: \`translateY(-50%) scaleX(\${highlightScaleX})\`,
                    transformOrigin: "left center",
                    backgroundColor: COLOR_HIGHLIGHT,
                    borderRadius: "0.2em",
                    opacity: highlightOpacity,
                    zIndex: 0,
                  }}
                />
                <span style={{ position: "relative", zIndex: 1 }}>
                  {HIGHLIGHT_WORD}
                </span>
              </span>
              <span>{postText}</span>
            </>
          ) : (
            <span>{FULL_TEXT}</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const typewriterHighlightExample: RemotionExample = {
  id: "typewriter-highlight",
  name: "Typewriter with Highlight",
  description: "Typewriter effect with blinking cursor and spring-animated word highlight",
  category: "Text",
  durationInFrames: 90,
  fps: 30,
  code: typewriterHighlightCode,
};
