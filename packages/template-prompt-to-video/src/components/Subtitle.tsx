import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Word } from "./Word";

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Word stroke enterProgress={enter} text={text} />
      </AbsoluteFill>
      <AbsoluteFill>
        <Word enterProgress={enter} text={text} stroke={false} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Subtitle;
