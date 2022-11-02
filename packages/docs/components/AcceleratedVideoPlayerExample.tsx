import { Player } from "@remotion/player";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  Video,
} from "remotion";

const remapSpeed = ({
  frame,
  speed,
}: {
  frame: number;
  speed: (fr: number) => number;
}) => {
  let framesPassed = 0;

  for (let i = 0; i <= frame; i++) {
    framesPassed += speed(i);
  }

  return framesPassed;
};

const AcceleratedVideo: React.FC = () => {
  // const [speed, setSpeed] = React.useState()
  const frame = useCurrentFrame();

  const speedFunction = (f: number) =>
    interpolate(f, [0, 500], [1, 5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const remappedFrame = remapSpeed({
    frame,
    speed: speedFunction,
  });

  return (
    <AbsoluteFill>
      <Sequence from={frame}>
        <Video
          startFrom={Math.round(remappedFrame)}
          playbackRate={speedFunction(frame)}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const AcceleratedVideoExample: React.FC = () => {
  return (
    <div>
      <Player
        component={AcceleratedVideo}
        compositionHeight={720}
        compositionWidth={850}
        durationInFrames={70}
        fps={30}
        controls
        style={{
          width: "100%",
          // height: "100%",
        }}
      />
    </div>
  );
};
