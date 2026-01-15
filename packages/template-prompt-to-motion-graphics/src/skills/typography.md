---
title: Typography & Text Animation
impact: HIGH
impactDescription: fixes common text animation bugs and improves readability
tags: typography, text, typewriter, kinetic, animation
---

## Typewriter Effect - Use String Slicing

Always use string slicing for typewriter effects. Never use per-character opacity.

**Incorrect (per-character opacity - breaks cursor positioning):**

```tsx
{
  text
    .split("")
    .map((char, i) => (
      <span style={{ opacity: i < typedCount ? 1 : 0 }}>{char}</span>
    ));
}
<span>|</span>;
```

**Correct (string slicing - cursor follows text):**

```tsx
const typedText = FULL_TEXT.slice(0, typedChars);

<span>{typedText}</span>
<span style={{ opacity: caretOpacity }}>▌</span>
```

## Cursor Blink - Use Smooth Interpolation

Blinking cursors should fade smoothly, not flash on/off abruptly.

**Incorrect (abrupt blink):**

```tsx
const caretVisible = Math.floor(frame / 15) % 2 === 0;
<span style={{ opacity: caretVisible ? 1 : 0 }}>|</span>;
```

**Correct (smooth blink):**

```tsx
const CURSOR_BLINK_FRAMES = 16;
const caretOpacity = interpolate(
  frame % CURSOR_BLINK_FRAMES,
  [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
  [1, 0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);

<span style={{ opacity: caretOpacity }}>▌</span>;
```

## Word Carousel - Stable Width Container

Prevent layout shifts by using the longest word to set container width.

**Incorrect (width jumps between words):**

```tsx
<div style={{ position: "relative" }}>
  <span>{WORDS[currentIndex]}</span>
</div>
```

**Correct (stable width from longest word):**

```tsx
const longestWord = WORDS.reduce(
  (a, b) => (a.length >= b.length ? a : b),
  WORDS[0],
);

<div style={{ position: "relative" }}>
  <div style={{ visibility: "hidden" }}>{longestWord}</div>
  <div style={{ position: "absolute", left: 0, top: 0 }}>
    {WORDS[currentIndex]}
  </div>
</div>;
```

## Text Highlight - Two Layer Crossfade

Use overlapping layers for smooth highlight transitions.

```tsx
const typedOpacity = interpolate(
  frame,
  [highlightStart - 8, highlightStart + 8],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
const finalOpacity = interpolate(
  frame,
  [highlightStart, highlightStart + 8],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);

{
  /* Typing layer */
}
<div style={{ opacity: typedOpacity }}>{typedText}</div>;

{
  /* Final layer with highlight */
}
<div style={{ position: "absolute", inset: 0, opacity: finalOpacity }}>
  <span>{preText}</span>
  <span style={{ backgroundColor: COLOR_HIGHLIGHT }}>{HIGHLIGHT_WORD}</span>
  <span>{postText}</span>
</div>;
```

---

## COMPLETE EXAMPLE: Typewriter with Highlight

Prompt: "Text with typewriter effect, pause mid-sentence, then highlight a word"

```tsx
import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

export const MyAnimation = () => {
  /*
   * Typewriter with blinking cursor, dramatic pause, spring-based highlight, and layer crossfade.
   */
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COLOR_TEXT = "#000000";
  const COLOR_HIGHLIGHT = "#A7C7E7";

  const FULL_TEXT = "From prompt to motion graphics. This is Remotion.";
  const HIGHLIGHT_WORD = "Remotion";
  const CARET_SYMBOL = "▌";
  const SPLIT_AFTER = " This is Remotion.";

  const FONT_SIZE = 72;
  const FONT_WEIGHT = 700;
  const CHAR_FRAMES = 2;
  const CURSOR_BLINK_FRAMES = 16;
  const HIGHLIGHT_DELAY = 6;
  const HIGHLIGHT_WIPE_DURATION = 18;
  const CROSSFADE_DURATION = 8;
  const WAIT_AFTER_PRE_SECONDS = 1;

  const WAIT_AFTER_PRE_FRAMES = Math.round(fps * WAIT_AFTER_PRE_SECONDS);
  const f = frame;

  const splitIndex = FULL_TEXT.indexOf(SPLIT_AFTER);
  const preLen = splitIndex >= 0 ? splitIndex : FULL_TEXT.length;
  const postLen = FULL_TEXT.length - preLen;

  let typedChars = 0;
  if (f < preLen * CHAR_FRAMES) {
    typedChars = Math.floor(f / CHAR_FRAMES);
  } else if (f < preLen * CHAR_FRAMES + WAIT_AFTER_PRE_FRAMES) {
    typedChars = preLen;
  } else {
    const postPhase = f - preLen * CHAR_FRAMES - WAIT_AFTER_PRE_FRAMES;
    typedChars = Math.min(
      FULL_TEXT.length,
      preLen + Math.floor(postPhase / CHAR_FRAMES),
    );
  }
  const typedText = FULL_TEXT.slice(0, typedChars);
  const typingDone = typedChars >= FULL_TEXT.length;

  const caretOpacity = !typingDone
    ? interpolate(
        f % CURSOR_BLINK_FRAMES,
        [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
        [1, 0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const highlightIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
  const hasHighlight = highlightIndex >= 0;
  const preText = hasHighlight ? FULL_TEXT.slice(0, highlightIndex) : FULL_TEXT;
  const postText = hasHighlight
    ? FULL_TEXT.slice(highlightIndex + HIGHLIGHT_WORD.length)
    : "";

  const typeEnd =
    preLen * CHAR_FRAMES + WAIT_AFTER_PRE_FRAMES + postLen * CHAR_FRAMES;
  const highlightStart = typeEnd + HIGHLIGHT_DELAY;

  const typedOpacity = interpolate(
    f,
    [highlightStart - CROSSFADE_DURATION, highlightStart + CROSSFADE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const finalOpacity = interpolate(
    f,
    [highlightStart, highlightStart + CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const entrance = spring({
    fps,
    frame: f,
    config: { damping: 200, stiffness: 120 },
    durationInFrames: 20,
  });
  const containerScale = interpolate(entrance, [0, 1], [0.98, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightProgress = spring({
    fps,
    frame: f - highlightStart,
    config: { damping: 200, stiffness: 180 },
    durationInFrames: HIGHLIGHT_WIPE_DURATION,
  });
  const highlightScaleX = Math.max(0, Math.min(1, highlightProgress));

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{ position: "relative", transform: `scale(${containerScale})` }}
      >
        {/* Typing layer */}
        <div
          style={{
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: 1.15,
            whiteSpace: "pre-wrap",
            opacity: typedOpacity,
          }}
        >
          <span>{typedText}</span>
          <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
        </div>
        {/* Final layer with highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: 1.15,
            whiteSpace: "pre-wrap",
            opacity: finalOpacity,
          }}
        >
          {hasHighlight ? (
            <>
              <span>{preText}</span>
              <span style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "50%",
                    height: "1.05em",
                    transform: `translateY(-50%) scaleX(${highlightScaleX})`,
                    transformOrigin: "left center",
                    backgroundColor: COLOR_HIGHLIGHT,
                    borderRadius: "0.18em",
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
};
```

---

## COMPLETE EXAMPLE: Rotating Word Carousel

Prompt: "Text that dissolves between different words"

```tsx
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";

export const MyAnimation = () => {
  /*
   * Prefix text with rotating words that crossfade with blur.
   */
  const frame = useCurrentFrame();

  const COLOR_TEXT = "#7b92c1";
  const PREFIX = "Created for";
  const WORDS = ["Creators", "Marketers", "Developers", "Everyone"];

  const PREFIX_FONT_SIZE = 80;
  const WORD_FONT_SIZE = 80;
  const PREFIX_WEIGHT = 300;
  const WORD_WEIGHT = 700;
  const WORD_GAP = 20;
  const HOLD_DURATION = 32;
  const FLIP_DURATION = 18;
  const BLUR_AMOUNT = 6;

  const perStep = HOLD_DURATION + FLIP_DURATION;
  const totalSteps = WORDS.length;
  const currentStep = Math.floor(frame / perStep) % totalSteps;
  const nextStep = (currentStep + 1) % totalSteps;
  const phase = frame % perStep;
  const isFlipping = phase >= HOLD_DURATION;
  const flipProgress = isFlipping ? (phase - HOLD_DURATION) / FLIP_DURATION : 0;

  const outOpacity = interpolate(flipProgress, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inOpacity = interpolate(flipProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outBlur = interpolate(flipProgress, [0, 1], [0, BLUR_AMOUNT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inBlur = interpolate(flipProgress, [0, 1], [BLUR_AMOUNT, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const longestWord = WORDS.reduce(
    (a, b) => (a.length >= b.length ? a : b),
    WORDS[0],
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: WORD_GAP,
          color: COLOR_TEXT,
        }}
      >
        <div style={{ fontSize: PREFIX_FONT_SIZE, fontWeight: PREFIX_WEIGHT }}>
          {PREFIX}
        </div>
        <div
          style={{
            position: "relative",
            fontSize: WORD_FONT_SIZE,
            fontWeight: WORD_WEIGHT,
          }}
        >
          {/* Invisible width keeper */}
          <div style={{ visibility: "hidden" }}>{longestWord}</div>
          {/* Current word (fades out during flip) */}
          {!isFlipping && (
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              {WORDS[currentStep]}
            </div>
          )}
          {/* Crossfade during flip */}
          {isFlipping && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: outOpacity,
                  filter: `blur(${outBlur}px)`,
                }}
              >
                {WORDS[currentStep]}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: inOpacity,
                  filter: `blur(${inBlur}px)`,
                }}
              >
                {WORDS[nextStep]}
              </div>
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```
