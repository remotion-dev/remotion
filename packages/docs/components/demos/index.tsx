import { Player } from "@remotion/player";
import React, { useMemo, useState } from "react";
import { NoiseComp } from "./NoiseDemo";

type DemoType = {
  id: string;
  comp: React.FC;
  compWidth: number;
  compHeight: number;
  fps: number;
  durationInFrames: number;
};

const noiseDemo: DemoType = {
  comp: NoiseComp,
  compHeight: 720,
  compWidth: 1280,
  durationInFrames: 150,
  fps: 30,
  id: "noise",
};

const container: React.CSSProperties = {
  overflow: "hidden",
  width: "100%",
  border: "1px solid var(--ifm-color-emphasis-300)",
  borderRadius: "var(--ifm-pre-border-radius)",
};

const demos: DemoType[] = [noiseDemo];

export const Demo: React.FC<{
  type: string;
}> = ({ type }) => {
  const [maxOffset, setMaxOffset] = useState(50);
  const [speed, setSpeed] = useState(0.01);
  const [circleRadius, setCircleRadius] = useState(5);

  const demo = demos.find((d) => d.id === type);

  if (!demo) {
    throw new Error("Demo not found");
  }

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
    <div style={container}>
      <Player
        component={demo.comp}
        compositionWidth={demo.compWidth}
        compositionHeight={demo.compHeight}
        durationInFrames={demo.durationInFrames}
        fps={demo.fps}
        style={{
          width: "100%",
          aspectRatio: demo.compWidth / demo.compHeight,
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
    </div>
  );
};
