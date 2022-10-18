import { noise3D } from "@remotion/noise";
import { Player } from "@remotion/player";
import React, { useMemo, useState } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  scale: number;
  speed: number;
  circleRadius: number;
}

const OVERSCAN_MARGIN = 100;

const NoiseComp: React.FC<Props> = ({ scale, speed, circleRadius }) => {
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

export const NoiseDemo = () => {
  const [scale, setScale] = useState(75);
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
