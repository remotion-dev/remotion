import { Audio } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { compSchema } from "./types";
import { Title } from "./HelloWorld/Title";
import { createS3Url } from "./tts";

export const HelloWorld: React.FC<z.infer<typeof compSchema>> = ({
  text,
  titleColor,
  voice,
  displaySpeed,
}) => {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();

  const opacity = interpolate(
    frame,
    [videoConfig.durationInFrames - 25, videoConfig.durationInFrames - 15],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill style={{ opacity }}>
        <Title
          displaySpeed={displaySpeed}
          text={text}
          titleColor={titleColor}
        />
        <Audio src={createS3Url({ text, voice })} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
