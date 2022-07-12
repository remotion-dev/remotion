import { Player } from "@remotion/player";
import React from "react";
import phone from "./3DPhone/assets/phone.mp4";
import { Scene } from "./3DPhone/Scene";

export const ThreeDPlayer: React.FC = () => {
  return (
    <Player
      component={Scene}
      compositionWidth={1280}
      compositionHeight={720}
      durationInFrames={300}
      controls
      loop
      autoPlay
      style={{
        width: "100%",
      }}
      fps={30}
      inputProps={{
        videoSrc: phone,
        baseScale: 1,
      }}
     />
  );
};
