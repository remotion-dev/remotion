---
title: Noise visualization
id: noise-visualization
---

Using the [@remotion/noise](/docs/noise) API, you can add noise for your videos.

## Noise Dot Grid Demo

This example shows how to create a floating dot grid "surface" using [createNoise3D](/docs/noise/create-noise-3d) function.

- 1st and 2nd dimensions used for space domain.
- 3rd dimension used for time domain. 

import { NoiseDemo } from "../components/NoiseDemo";

<NoiseDemo/>

<hr/>

```tsx twoslash
import React, { useMemo, useState } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Player } from "@remotion/player";
import { createNoise3D } from "@remotion/noise";

const xNoise3d = createNoise3D("x");
const yNoise3d = createNoise3D("y");
const opacityNoise3d = createNoise3D("opacity");
const colorNoise3d = createNoise3D("color");

interface Props {
  scale: number
  speed: number
  circleRadius: number
}

const Background: React.FC<Props> = ({
  scale,
  speed,
  circleRadius,
}) => {
  const config = useVideoConfig();
  const frame = useCurrentFrame();
  const overscanMargin = 100;
  const width = config.width + overscanMargin;
  const height = config.height + overscanMargin;
  const rows = Math.round(height / scale);
  const cols = Math.round(width / scale);
  return (
    <>
      {new Array(cols).fill(0).map((_i, i) =>
        new Array(rows).fill(0).map((_j, j) => {
          const key = `${i}-${j}`;
          const x = i * scale;
          const y = j * scale;
          const px = i / cols;
          const py = j / rows;
          const dx = xNoise3d(px, py, frame * speed) * scale;
          const dy = yNoise3d(px, py, frame * speed) * scale;
          const opacity = interpolate(
            opacityNoise3d(i, j, frame * speed),
            [-1, 1],
            [0, 1],
            { easing: Easing.bezier(0.85, 0, 0.15, 1) }
          );
          const color =
            Math.round(
              interpolate(
                colorNoise3d(px, py, frame * speed),
                [-1, 1],
                [0, 1]
              )
            ) === 0 ? "0,87,184" : "254,221,0";
          return (
            <circle
              key={key}
              cx={x + dx}
              cy={y + dy}
              r={circleRadius}
              fill={`rgba(${color}, ${opacity})`}
            />
          );
        })
      )}
    </>
  );
};

const MyComposition: React.FC<Props> = (props) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill="black" />
        <Background {...props} />
        <defs>
          <filter
            id="blur"
            x="0"
            y="0"
            width={width}
            height={height}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
}

export const NoiseDemo = () => {
  const fps = 30;
  const [scale, setScale] = useState(75);
  const [speed, setSpeed] = useState(0.01);
  const [circleRadius, setCircleRadius] = useState(5);

  const inputStyle = useMemo<React.CSSProperties>(() => ({
    width: 90,
    marginRight: 8
  }), []);
  const labelStyle = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
  }), []);

  return (
    <>
      <Player
        component={MyComposition}
        compositionWidth={1280}
        compositionHeight={720}
        durationInFrames={fps * 5}
        fps={fps}
        style={{
          width: "100%",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "var(--ifm-pre-border-radius)",
        }}
        inputProps={{
          scale,
          speed,
          circleRadius,
        }}
        autoPlay
        loop
      />
      <div>
        <label style={labelStyle}>
          <input
            type="range"
            min={50} // don't set too low values, otherwise you're going to kill the DOM thread spawning lots of dots
            max={200}
            step={1}
            value={scale}
            style={inputStyle}
            onChange={(e) => setScale(Number(e.target.value))}
          />
          <code>{`scale={${scale}}`}</code>
        </label>
        <label style={labelStyle}>
          <input
            type="range"
            min={0.001}
            max={0.025}
            step={0.001}
            value={speed}
            style={inputStyle}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <code>{`speed={${speed}}`}</code>
        </label>
        <label style={labelStyle}>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={circleRadius}
            style={inputStyle}
            onChange={(e) => setCircleRadius(Number(e.target.value))}
          />
          <code>{`circleRadius={${circleRadius}}`}</code>
        </label>
      </div>
    </>
  );
};
```

## See also

- [`@remotion/noise API`](/docs/noise)
