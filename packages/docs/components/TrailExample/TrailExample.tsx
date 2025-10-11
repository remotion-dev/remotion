import { Player } from "@remotion/player";
import React, { useState } from "react";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { Trail } from "@remotion/motion-blur";

const square: React.CSSProperties = {
  height: 150,
  width: 150,
  backgroundColor: "#0b84f3",
  borderRadius: 14,
  fontSize: 100,
  fontWeight: "bold",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
};

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
};

const spacer: React.CSSProperties = {
  width: 40,
};

export const Square: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const spr = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: 60,
  });

  const rotate = interpolate(spr, [0, 1], [Math.PI, 0]);
  const y = interpolate(spr, [0, 1], [height, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        transform: `translateY(${y}px) rotate(${rotate}rad)`,
      }}
    >
      <div style={square}>A</div>
    </AbsoluteFill>
  );
};

const MyComposition = ({
  trailOpacity,
  layers,
  lagInFrames,
}: {
  readonly trailOpacity: number;
  readonly layers: number;
  readonly lagInFrames: number;
}) => {
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <AbsoluteFill style={{ padding: 30 }}>
          <h1>Still</h1>
        </AbsoluteFill>
        <Freeze frame={38}>
          <Trail
            trailOpacity={trailOpacity}
            lagInFrames={lagInFrames}
            layers={layers}
          >
            <Square />
          </Trail>
        </Freeze>
      </div>
      <div
        style={{
          width: 1,
          background: "var(--ifm-color-emphasis-300)",
        }}
      />
      <div style={{ flex: 1, position: "relative" }}>
        <AbsoluteFill style={{ padding: 30 }}>
          <h1>Animation</h1>
        </AbsoluteFill>
        <Trail
          trailOpacity={trailOpacity}
          lagInFrames={lagInFrames}
          layers={layers}
        >
          <Square />
        </Trail>
      </div>
    </AbsoluteFill>
  );
};

export const TrailExample: React.FC = () => {
  const [trailOpacity, setTrailOpacity] = useState(1);
  const [lagInFrames, setFrameDelay] = useState(0.3);
  const [layers, setLayers] = useState(50);

  return (
    <div>
      <Player
        component={MyComposition}
        compositionWidth={1280}
        compositionHeight={720}
        durationInFrames={70}
        fps={30}
        style={{
          width: "100%",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "var(--ifm-pre-border-radius)",
        }}
        inputProps={{
          trailOpacity,
          lagInFrames,
          layers,
        }}
        autoPlay
        loop
      />
      <br />
      <div style={{ ...row, fontSize: 20 }}>
        <label style={row}>
          <input
            type="range"
            min={0}
            max={100}
            value={layers}
            style={{ width: 90, marginRight: 8, padding: 8 }}
            onChange={(e) => setLayers(Number(e.target.value))}
          />
          <code>
            layers={"{"}
            {layers}
            {"}"}
          </code>
        </label>
        <div style={spacer} />

        <label style={row}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={trailOpacity}
            style={{ width: 90, marginRight: 8 }}
            onChange={(e) => setTrailOpacity(Number(e.target.value))}
          />
          <code>
            trailOpacity={"{"}
            {trailOpacity}
            {"}"}
          </code>
        </label>
        <div style={spacer} />

        <label style={row}>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={lagInFrames}
            style={{ width: 90, marginRight: 8, padding: 8 }}
            onChange={(e) => setFrameDelay(Number(e.target.value))}
          />
          <code>
            lagInFrames={"{"}
            {lagInFrames}
            {"}"}
          </code>
        </label>

        <div style={spacer} />
      </div>
    </div>
  );
};
