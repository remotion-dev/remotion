import { Player } from "@remotion/player";
import React from "react";
import { ColorDemo } from "./ColorDemo";
import "./input-fields.css";

export const PlayerExample: React.FC<{ name: string; color: string }> = ({
  name,
  color,
}) => {
  return (
    <Player
      component={ColorDemo}
      compositionWidth={1280}
      compositionHeight={720}
      controls
      durationInFrames={350}
      fps={30}
      inputProps={{
        name,
        color,
      }}
      style={{
        width: "100%",
      }}
      loop
    />
  );
};
