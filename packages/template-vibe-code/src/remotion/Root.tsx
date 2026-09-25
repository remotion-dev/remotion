import React from "react";
import { Composition } from "remotion";
import { Launch } from "./Launch";
import { SquarePost } from "./SquarePost";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Launch"
        component={Launch}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={180}
        defaultProps={{
          title: "Ship motion graphics with code",
          subtitle: "Edit the code, the canvas or the timeline",
          accent: "#0b84f3",
        }}
      />
      <Composition
        id="SquarePost"
        component={SquarePost}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={120}
        defaultProps={{
          headline: "New drop",
          color: "#f97316",
        }}
      />
    </>
  );
};
