---
name: typography
description: Typography and text animation patterns for Remotion. Use when creating typewriter effects, kinetic text, word carousels, animated titles, or text-heavy content.
metadata:
  impact: HIGH
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

## Complete Examples

For full working code examples, see:
- [Typewriter with Highlight Example](../example-typewriter-highlight/SKILL.md) - Typewriter effect with cursor blink, pause, and word highlight
- [Word Carousel Example](../example-word-carousel/SKILL.md) - Rotating words with crossfade and blur
- [Text Rotation Example](../example-text-rotation/SKILL.md) - Rotating words with dissolve and blur effects
