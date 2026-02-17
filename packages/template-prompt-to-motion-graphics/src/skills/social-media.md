---
title: Social Media Content
impact: MEDIUM
impactDescription: optimizes content for mobile viewing and engagement
tags: social, instagram, tiktok, reels, stories, mobile
---

## Safe Zone for UI Overlays

Keep key content in the center 80% to avoid platform UI elements.

**Incorrect (content at edges - gets covered by UI):**

```tsx
<AbsoluteFill style={{ padding: 10 }}>
  <div style={{ position: "absolute", top: 0 }}>Title</div>
  <div style={{ position: "absolute", bottom: 0 }}>CTA</div>
</AbsoluteFill>
```

**Correct (content in safe zone):**

```tsx
const SAFE_MARGIN_TOP = height * 0.12;
const SAFE_MARGIN_BOTTOM = height * 0.15;
const SAFE_MARGIN_SIDES = width * 0.05;

<AbsoluteFill style={{
  paddingTop: SAFE_MARGIN_TOP,
  paddingBottom: SAFE_MARGIN_BOTTOM,
  paddingLeft: SAFE_MARGIN_SIDES,
  paddingRight: SAFE_MARGIN_SIDES
}}>
  {content}
</AbsoluteFill>
```

## Mobile-First Text Sizing

Text must be readable on small screens. Minimum 48px for headlines.

**Incorrect (text too small for mobile):**

```tsx
const TITLE_SIZE = 24;
const BODY_SIZE = 14;
```

**Correct (mobile-readable sizes):**

```tsx
const TITLE_SIZE = Math.max(48, Math.round(width * 0.08));
const BODY_SIZE = Math.max(28, Math.round(width * 0.045));
```

## Hook in First Frames

Social content needs immediate visual interest. Add movement from frame 0.

**Incorrect (static start):**

```tsx
const entrance = spring({ frame: frame - 30, fps }); // Starts after 1 second
```

**Correct (immediate hook):**

```tsx
const entrance = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
const pulse = Math.sin(frame * 0.15) * 0.03 + 1; // Subtle constant motion

<div style={{ transform: `scale(${entrance * pulse})` }}>
  {content}
</div>
```

## High Contrast Colors

Use bold, saturated colors that pop on mobile screens.

```tsx
// Good for social
const COLOR_PRIMARY = "#FF3366";
const COLOR_ACCENT = "#00D4FF";
const COLOR_BG = "#0A0A0A";

// Avoid muted/pastel colors that look washed out
// const COLOR_PRIMARY = "#C4A4A4"; // Too muted
```

## Loop-Friendly Endings

Design animations that can seamlessly loop.

```tsx
const TOTAL_DURATION = durationInFrames;
const loopProgress = (frame % TOTAL_DURATION) / TOTAL_DURATION;

// Or fade to start state at the end
const fadeOut = interpolate(frame, [TOTAL_DURATION - 15, TOTAL_DURATION], [1, 0]);
```
