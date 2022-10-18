---
title: Noise visualization
id: noise-visualization
---

Using the [`@remotion/noise`](/docs/noise) package, you can add noise for your videos.

## Noise Dot Grid Demo

This example shows how to create a floating dot grid "surface" using [`noise3D()`](/docs/noise/noise-3d) function.

- 1st and 2nd dimensions used for space domain.
- 3rd dimension used for time domain.

import { NoiseDemo } from "../components/NoiseDemo";

<NoiseDemo/>

<hr/>

```tsx twoslash
import { noise3D } from "@remotion/noise";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const OVERSCAN_MARGIN = 100;

const NoiseComp: React.FC<{
  scale: number;
  speed: number;
  circleRadius: number;
}> = ({ scale, speed, circleRadius }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const rows = Math.round((height + OVERSCAN_MARGIN) / scale);
  const cols = Math.round((width + OVERSCAN_MARGIN) / scale);

  return (
    <svg width={width} height={height}>
      {new Array(cols).fill(0).map((_, i) =>
        new Array(rows).fill(0).map((__, j) => {
          const x = i * scale;
          const y = j * scale;
          const px = i / cols;
          const py = j / rows;
          const dx = noise3D("x", px, py, frame * speed) * scale;
          const dy = noise3D("y", px, py, frame * speed) * scale;
          const opacity = interpolate(
            noise3D("opacity", i, j, frame * speed),
            [-1, 1],
            [0, 1]
          );
          const color =
            noise3D("color", px, py, frame * speed) < 0
              ? "rgb(0,87,184)"
              : "rgb(254,221,0)";
          return (
            <circle
              // eslint-disable-next-line react/no-array-index-key
              key={`${i}-${j}`}
              cx={x + dx}
              cy={y + dy}
              r={circleRadius}
              fill={color}
              opacity={opacity}
            />
          );
        })
      )}
    </svg>
  );
};
```

## See also

- [`@remotion/noise`](/docs/noise)
