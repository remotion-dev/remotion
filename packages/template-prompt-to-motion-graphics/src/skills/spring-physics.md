---
title: Spring Physics Animation
impact: HIGH
impactDescription: creates natural, organic motion instead of mechanical animations
tags: spring, physics, bounce, easing, organic
---

## Prefer spring() Over interpolate()

Use spring() for natural motion, interpolate() only for linear progress.

**Incorrect (mechanical motion):**

```tsx
const scale = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
```

**Correct (organic spring motion):**

```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 100 },
  durationInFrames: 30
});
```

## Spring Config Parameters

```tsx
spring({
  frame,
  fps,
  config: {
    damping: 10,     // Higher = less bounce (10-200)
    stiffness: 100,  // Higher = faster snap (50-200)
    mass: 1,         // Higher = more inertia (0.5-3)
  }
});
```

## Common Spring Presets

```tsx
// Snappy, minimal bounce (UI elements)
const snappy = { damping: 20, stiffness: 200 };

// Bouncy entrance (playful animations)
const bouncy = { damping: 8, stiffness: 100 };

// Smooth, no bounce (subtle reveals)
const smooth = { damping: 200, stiffness: 100 };

// Heavy, slow (large objects)
const heavy = { damping: 15, stiffness: 80, mass: 2 };
```

## Delayed Spring Start

Offset the frame for delayed spring animations:

**Incorrect (spring starts immediately):**

```tsx
const entrance = spring({ frame, fps, config: { damping: 12 } });
```

**Correct (spring starts after delay):**

```tsx
const ENTRANCE_DELAY = 20;
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  config: { damping: 12, stiffness: 100 }
});
// Returns 0 until frame 20, then animates to 1
```

## Spring for Scale with Overshoot

For bouncy scale animations that overshoot:

```tsx
const bounce = spring({
  frame,
  fps,
  config: { damping: 8, stiffness: 150 }
});
// Will overshoot past 1.0 before settling

<div style={{ transform: `scale(${bounce})` }}>
  {content}
</div>
```

## Combining Spring with Interpolate

Map spring output (0-1) to custom ranges:

```tsx
const springProgress = spring({ frame, fps, config: { damping: 15 } });

// Map to rotation
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

// Map to position
const translateY = interpolate(springProgress, [0, 1], [50, 0]);

<div style={{ transform: `translateY(${translateY}px) rotate(${rotation}deg)` }}>
```

## Chained Springs for Sequential Motion

```tsx
const PHASE_1_END = 30;
const PHASE_2_START = 25; // Slight overlap

const phase1 = spring({ frame, fps, config: { damping: 15 } });
const phase2 = spring({
  frame: frame - PHASE_2_START,
  fps,
  config: { damping: 12 }
});

// phase1 controls entrance, phase2 controls secondary motion
```
