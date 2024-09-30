import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Text } from "./HelloWorld/Title";
import { voices } from "./server/TextToSpeech/constants";
import { RequestMetadata, VoiceType } from "./lib/interfaces";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const mySchema = z.object({
  titleText: z.string(),
  subtitleText: z.string(),
  titleColor: zColor(),
  voice: z.enum(
    Object.keys(voices) as [VoiceType] | [VoiceType, ...VoiceType[]],
  ),
  pitch: z.coerce.number().min(-20).max(20),
  speakingRate: z.coerce.number().min(0.25).max(4),
  audioUrl: z.string().or(z.null()),
});

export const HelloWorld: React.FC<RequestMetadata> = (props) => {
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
  const transitionStart = 25;

  return (
    <AbsoluteFill style={{ flex: 1, backgroundColor: "white" }}>
      <div style={{ opacity }}>
        <Sequence from={transitionStart + 10}>
          <Text {...props} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
