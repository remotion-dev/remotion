import { Player } from "@remotion/player";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
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

const DelayExample: React.FC = () => {
  return (
    <Sequence from={30}>
      <BlueSquare />
    </Sequence>
  );
};

const TrimStartExample: React.FC = () => {
  return (
    <Sequence from={-15}>
      <BlueSquare />
    </Sequence>
  );
};

const TrimAndDelayExample: React.FC = () => {
  return (
    <Sequence from={30}>
      <Sequence from={-15}>
        <BlueSquare />
      </Sequence>
    </Sequence>
  );
};

const ClipExample: React.FC = () => {
  return (
    <Sequence from={0} durationInFrames={45}>
      <BlueSquare />
    </Sequence>
  );
};

const BaseExample: React.FC = () => {
  return <BlueSquare />;
};

export const SequenceForwardExample: React.FC<{
  readonly type: "base" | "delay" | "clip" | "trim-start" | "trim-and-delay";
}> = ({ type }) => {
  const component = (() => {
    if (type === "base") {
      return BaseExample;
    }

    if (type === "delay") {
      return DelayExample;
    }

    if (type === "trim-start") {
      return TrimStartExample;
    }

    if (type === "trim-and-delay") {
      return TrimAndDelayExample;
    }

    if (type === "clip") {
      return ClipExample;
    }

    throw new TypeError("oops");
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
          height: 200,
        }}
        loop
      />
    </div>
  );
};
