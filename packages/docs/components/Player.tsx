import { Player } from "@remotion/player";
import React from "react";
import { useCurrentFrame } from "remotion";

const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: 200 }}>{frame}</div>;
};

export const PlayerExample: React.FC = () => {
  return (
    <Player
      component={Comp}
      compositionWidth={1280}
      compositionHeight={720}
      controls
      durationInFrames={100}
      fps={30}
      style={{
        aspectRatio: "16 / 9",
        height: undefined,
        width: "100%",
      }}
      loop
    ></Player>
  );
};
