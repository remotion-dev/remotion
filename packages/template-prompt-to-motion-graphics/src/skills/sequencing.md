---
title: Timing & Sequencing
impact: HIGH
impactDescription: controls when elements appear and enables complex choreography
tags: sequence, series, timing, delay, choreography
---

## Sequence for Delayed Elements

Use Sequence to delay when an element appears in the timeline.

**Incorrect (manual frame checks):**

```tsx
{frame >= 30 && <Title />}
{frame >= 60 && <Subtitle />}
```

**Correct (Sequence component):**

```tsx
import { Sequence } from "remotion";

<Sequence from={30} durationInFrames={90}>
  <Title />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <Subtitle />
</Sequence>
```

## Series for Sequential Playback

Use Series when elements should play one after another without overlap.

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={45}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <MainContent />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Outro />
  </Series.Sequence>
</Series>
```

## Series with Offset for Overlap

Use negative offset for overlapping sequences:

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}>
    {/* Starts 15 frames before SceneA ends */}
    <SceneB />
  </Series.Sequence>
</Series>
```

## Staggered Element Entrances

For staggered animations of multiple items, calculate delays:

**Incorrect (hardcoded delays):**

```tsx
const items = data.map((item, i) => {
  const delay = i === 0 ? 0 : i === 1 ? 10 : i === 2 ? 20 : 30;
  // ...
});
```

**Correct (calculated stagger):**

```tsx
const STAGGER_DELAY = 8;
const BASE_DELAY = 15;

const items = data.map((item, i) => {
  const delay = BASE_DELAY + i * STAGGER_DELAY;
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 }
  });
  return <Item key={i} style={{ opacity: progress, transform: `translateY(${(1 - progress) * 20}px)` }} />;
});
```

## Nested Sequences

Sequences can be nested for complex timing:

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} durationInFrames={90}>
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60}>
    <Subtitle />
  </Sequence>
</Sequence>
```

## Frame References Inside Sequences

Inside a Sequence, useCurrentFrame() returns the local frame (starting from 0):

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Inside MyComponent, useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```

---

## COMPLETE EXAMPLE: Staggered List Animation

Prompt: "A list of features that animate in one by one with a slide and fade effect"

```tsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring } from "remotion";

export const MyAnimation = () => {
  /*
   * Feature list with staggered spring entrances and subtle hover-like highlights.
   */
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COLOR_BG = "#0f0f0f";
  const COLOR_TEXT = "#ffffff";
  const COLOR_ACCENT = "#6366f1";
  const COLOR_MUTED = "#a1a1aa";

  const TITLE = "Why Choose Us";
  const FEATURES = [
    { icon: "⚡", title: "Lightning Fast", desc: "Built for speed from the ground up" },
    { icon: "🔒", title: "Secure by Default", desc: "Enterprise-grade security included" },
    { icon: "🎨", title: "Beautiful Design", desc: "Crafted with attention to detail" },
    { icon: "🚀", title: "Scale Infinitely", desc: "Grows with your business needs" },
  ];

  const TITLE_FONT_SIZE = 48;
  const ITEM_FONT_SIZE = 28;
  const DESC_FONT_SIZE = 18;
  const ICON_SIZE = 48;
  const ITEM_GAP = 24;
  const PADDING = 60;

  const TITLE_START = 0;
  const ITEMS_START = 20;
  const STAGGER_DELAY = 12;
  const SLIDE_DISTANCE = 30;

  const titleProgress = spring({
    frame: frame - TITLE_START,
    fps,
    config: { damping: 20, stiffness: 100 }
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLOR_BG,
      padding: PADDING,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif"
    }}>
      {/* Title */}
      <div style={{
        fontSize: TITLE_FONT_SIZE,
        fontWeight: 700,
        color: COLOR_TEXT,
        marginBottom: 40,
        opacity: titleProgress,
        transform: `translateY(${(1 - titleProgress) * 20}px)`
      }}>
        {TITLE}
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: ITEM_GAP }}>
        {FEATURES.map((feature, i) => {
          const itemStart = ITEMS_START + i * STAGGER_DELAY;
          const itemProgress = spring({
            frame: frame - itemStart,
            fps,
            config: { damping: 15, stiffness: 120 }
          });
          const opacity = interpolate(itemProgress, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const translateX = interpolate(itemProgress, [0, 1], [SLIDE_DISTANCE, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity,
                transform: `translateX(${translateX}px)`
              }}
            >
              <div style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                borderRadius: 12,
                backgroundColor: COLOR_ACCENT + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24
              }}>
                {feature.icon}
              </div>
              <div>
                <div style={{ fontSize: ITEM_FONT_SIZE, fontWeight: 600, color: COLOR_TEXT }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: DESC_FONT_SIZE, color: COLOR_MUTED, marginTop: 4 }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```
