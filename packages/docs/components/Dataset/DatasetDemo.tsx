import { Player } from "@remotion/player";
import React from "react";
import { MyComp } from "./MyComp";

export const DatasetDemo: React.FC = () => {
  return (
    <div>
      <Player
        component={MyComp}
        compositionWidth={1280}
        compositionHeight={720}
        fps={30}
        durationInFrames={60}
        controls
        autoPlay
        loop
        style={{
          width: "100%",
        }}
        inputProps={{
          name: "Remotion",
          logo: "https://github.com/remotion-dev/logo/raw/main/withouttitle/element-0.png",
          repo: "remotion-dev/remotion",
        }}
      />
    </div>
  );
};
