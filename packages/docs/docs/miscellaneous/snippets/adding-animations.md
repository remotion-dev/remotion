---
title: Adding and subtracting animations
---

<div style={{height: 200}}>
<video style={{
  width: 200,
  height: 200,
  boxShadow: 'var(--box-shadow)',
  float: 'left',
  borderRadius: 4,
  marginRight: 10
}} src="/img/pushes.mp4" autoPlay muted loop></video>

<p>This example demonstrates that animation values can be added, subtracted, multiplied and divided with each other to create more complex animations. The standard JavaScript operators like <code>+</code> and <code>-</code> may be used.</p>
</div>
<br/>

```tsx twoslash
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const TwoPushes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scalePush1 = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const scalePush2 = spring({
    fps,
    frame: frame - 30,
    config: {
      damping: 200,
    },
  });

  const scalePush3 = spring({
    fps,
    frame: frame - 60,
    config: {
      damping: 200,
    },
  });

  const scale = scalePush1 + scalePush2 + scalePush3;

  const left =
    interpolate(scalePush1, [0, 1], [0, 80]) +
    interpolate(scalePush2, [0, 1], [0, 80]) +
    interpolate(scalePush3, [0, 1], [0, 80]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: 50,
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          height: 100,
          width: 100,
          backgroundColor: "#4290f5",
          borderRadius: 40,
          transform: `scale(${scale}) translateX(${left}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
```
