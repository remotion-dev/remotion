import { Player } from "@remotion/player";
import React from "react";
import { AbsoluteFill, Series, useCurrentFrame } from "remotion";

const Square: React.FC<{
  readonly color: string;
}> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          height: 200,
          width: 200,
          backgroundColor: color,
          borderRadius: 20,
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

const BaseExample: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={40}>
        <Square color={"#3498db"} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={20}>
        <Square color={"#5ff332"} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={70}>
        <Square color={"#fdc321"} />
      </Series.Sequence>
    </Series>
  );
};

export const SeriesExample: React.FC<{
  readonly type: "base";
}> = ({ type }) => {
  const component = (() => {
    if (type === "base") {
      return BaseExample;
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
          width: "100%",
        }}
        loop
      />
    </div>
  );
};
