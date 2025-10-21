import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  staticFile,
  useDelayRender,
} from "remotion";
import { z } from "zod";
import { Timeline } from "./types";
import { IntoFrameDuration, FPS } from "./constants";
import { loadFont } from "@remotion/google-fonts/Signika";
import { Background } from "./components/Background";
import Subtitle from "./components/Subtitle";
import { useEffect, useState } from "react";
import { getAudioPath, getTimelinePath, loadTimelineFromFile } from "./utils";

export const aiVideoSchema = z.object({
  projectName: z.string().min(1),
  hasWatermark: z.boolean(),
});

const calculateFrameTiming = (
  startMs: number,
  endMs: number,
  options: { includeIntro?: boolean; addIntroOffset?: boolean } = {},
) => {
  const { includeIntro = false, addIntroOffset = false } = options;

  const startFrame =
    (startMs * FPS) / 1000 + (addIntroOffset ? IntoFrameDuration : 0);
  const duration =
    ((endMs - startMs) * FPS) / 1000 + (includeIntro ? IntoFrameDuration : 0);

  return { startFrame, duration };
};

export const AIVideo: React.FC<z.infer<typeof aiVideoSchema>> = ({
  projectName,
}) => {
  const { fontFamily } = loadFont();
  const [timeline, setTimeline] = useState<Timeline | null>();
  const { delayRender, continueRender } = useDelayRender();

  useEffect(() => {
    const handle = delayRender("Loading timeline...");

    const fetchConfig = async () => {
      const { timeline } = await loadTimelineFromFile(
        getTimelinePath(projectName),
      );
      setTimeline(timeline);
      continueRender(handle);
    };

    fetchConfig();

    return () => {
      continueRender(handle);
    };
  }, [projectName]);

  const ready = true;

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {ready && timeline && (
        <>
          <Sequence durationInFrames={IntoFrameDuration}>
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                display: "flex",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: 120,
                  lineHeight: "122px",
                  width: "87%",
                  color: "black",
                  fontFamily,
                  textTransform: "uppercase",
                  backgroundColor: "yellow",
                  paddingTop: 20,
                }}
              >
                {timeline.shortTitle}
              </div>
            </AbsoluteFill>
          </Sequence>

          {timeline.elements.map((element, index) => {
            const { startFrame, duration } = calculateFrameTiming(
              element.startMs,
              element.endMs,
              { includeIntro: index === 0 },
            );

            return (
              <Sequence
                key={`element-${index}`}
                from={startFrame}
                durationInFrames={duration}
              >
                <Background project={projectName} item={element} />
              </Sequence>
            );
          })}

          {timeline.text.map((element, index) => {
            const { startFrame, duration } = calculateFrameTiming(
              element.startMs,
              element.endMs,
              { addIntroOffset: true },
            );

            return (
              <Sequence
                key={`element-${index}`}
                from={startFrame}
                durationInFrames={duration}
              >
                <Subtitle key={index} text={element.text} />
              </Sequence>
            );
          })}

          {timeline.audio.map((element, index) => {
            const { startFrame, duration } = calculateFrameTiming(
              element.startMs,
              element.endMs,
              { addIntroOffset: true },
            );

            return (
              <Sequence
                key={`element-${index}`}
                from={startFrame}
                durationInFrames={duration}
              >
                <Html5Audio
                  src={staticFile(getAudioPath(projectName, element.audioUrl))}
                />
              </Sequence>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
