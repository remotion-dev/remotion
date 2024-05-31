import { Player } from "@remotion/player";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Loop,
  spring,
  useCurrentFrame,
} from "remotion";

const BlueSquare: React.FC = () => {
  const frame = useCurrentFrame();
  const animation = spring({
    fps: 30,
    frame,
    config: {
      damping: 400,
    },
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          height: 200,
          width: 200,
          backgroundColor: "#3498db",
          borderRadius: 20,
          transform: `translateY(${interpolate(
            animation,
            [0, 1],
            [600, 0],
          )}px)`,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 50,
        }}
      >
        {frame}
      </div>
    </AbsoluteFill>
  );
};

const BaseExample: React.FC = () => (
  <Loop durationInFrames={50}>
    <BlueSquare />
  </Loop>
);

const TimesExample: React.FC = () => (
  <Loop durationInFrames={50} times={2}>
    <BlueSquare />
  </Loop>
);

const NestedExample: React.FC = () => (
  <Loop durationInFrames={75}>
    <Loop durationInFrames={30}>
      <BlueSquare />
    </Loop>
  </Loop>
);

export const LoopExamples: React.FC<{
  readonly type: "base" | "times" | "nested";
}> = ({ type }) => {
  const component = (() => {
    if (type === "base") {
      return BaseExample;
    }

    if (type === "times") {
      return TimesExample;
    }

    if (type === "nested") {
      return NestedExample;
    }

    return BlueSquare;
  })();
  return (
    <div>
      <Player
        component={component}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        durationInFrames={150}
        fps={30}
        style={{
          backgroundColor: "#eee",
          height: 200,
        }}
        loop
      />
    </div>
  );
};
