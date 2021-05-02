import { Player } from "@remotion/player";
import React from "react";
import { useCurrentFrame } from "../../babel-loader/node_modules/remotion/dist";

const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: 200 }}>{frame}</div>;
};

export const PlayerExample: React.FC = () => {
  return (
    <Player
      component={Comp}
      width={900}
      height={500}
      controls
      durationInFrames={100}
      fps={30}
      loop
    ></Player>
  );
};
