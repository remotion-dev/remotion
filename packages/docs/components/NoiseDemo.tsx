import { noise3D } from "@remotion/noise";
import { Player } from "@remotion/player";
import React, { useMemo, useState } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  speed: number;
  circleRadius: number;
  maxOffset: number;
}

const OVERSCAN_MARGIN = 100;
const ROWS = 10;
const COLS = 15;

const NoiseComp: React.FC<Props> = ({ speed, circleRadius, maxOffset }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  return (
    <svg width={width} height={height}>
      {new Array(COLS).fill(0).map((_, i) =>
        new Array(ROWS).fill(0).map((__, j) => {
          const x = i * ((width + OVERSCAN_MARGIN) / COLS);
          const y = j * ((height + OVERSCAN_MARGIN) / ROWS);
          const px = i / COLS;
          const py = j / ROWS;
          const dx = noise3D("x", px, py, frame * speed) * maxOffset;
          const dy = noise3D("y", px, py, frame * speed) * maxOffset;
          const opacity = interpolate(
            noise3D("opacity", i, j, frame * speed),
            [-1, 1],
            [0, 1]
          );

          const key = `${i}-${j}`;

          return (
            <circle
              key={key}
              cx={x + dx}
              cy={y + dy}
              r={circleRadius}
              fill="gray"
              opacity={opacity}
            />
          );
        })
      )}
    </svg>
  );
};

export const NoiseDemo = () => {
  const [maxOffset, setMaxOffset] = useState(50);
  const [speed, setSpeed] = useState(0.01);
  const [circleRadius, setCircleRadius] = useState(5);

  const inputStyle = useMemo<React.CSSProperties>(
    () => ({
      width: 90,
      marginRight: 8,
    }),
    []
  );
  const labelStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      margin: 8,
    }),
    []
  );

  return (
    <>
      <Player
        component={NoiseComp}
        compositionWidth={1280}
        compositionHeight={720}
        durationInFrames={150}
        fps={30}
        style={{
          width: "100%",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "var(--ifm-pre-border-radius)",
        }}
        inputProps={{
          maxOffset,
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
            min={0}
            max={100}
            step={1}
            value={maxOffset}
            style={inputStyle}
            onChange={(e) => setMaxOffset(Number(e.target.value))}
          />
          <code>{`maxOffset={${maxOffset}}`}</code>
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
