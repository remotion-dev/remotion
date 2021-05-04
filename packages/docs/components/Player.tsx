import { Player } from "@remotion/player";
import React from "react";
import { useCurrentFrame } from "remotion";
import { Main } from "./ColorDemo/Main";

const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: 200 }}>{frame}</div>;
};

export const PlayerExample: React.FC = () => {
  return (
    <Player
      component={Main}
      compositionWidth={1280}
      compositionHeight={720}
      controls
      durationInFrames={350}
      fps={30}
      inputProps={{
        name: "Jonny",
        color: "#d4afdf",
      }}
      style={{
        aspectRatio: "16 / 9",
        height: undefined,
        width: "100%",
      }}
      loop
    ></Player>
  );
};
