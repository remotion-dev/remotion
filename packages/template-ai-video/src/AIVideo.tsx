import { AbsoluteFill, Html5Audio, Sequence, useDelayRender } from "remotion";
import { z } from "zod";
import { Timeline } from "./types";
import { IntoFrameDuration, FPS } from "./constants";
import { loadFont } from "@remotion/google-fonts/Signika";
import { Background } from "./components/Background";
import Subtitle from "./components/Subtitle";
import { useEffect, useState } from "react";
import { loadTimelineFromFile } from "./utils";

export const aiVideoSchema = z.object({
  timelineFile: z.string().min(1),
  hasWatermark: z.boolean(),
});

export const AIVideo: React.FC<z.infer<typeof aiVideoSchema>> = ({
  timelineFile,
}) => {
  const { fontFamily } = loadFont();
  const [timeline, setTimeline] = useState<Timeline | null>();
  const { delayRender, continueRender } = useDelayRender();

  useEffect(() => {
    const handle = delayRender("Loading timeline...");

    const fetchConfig = async () => {
      const { timeline } = await loadTimelineFromFile(timelineFile);
      setTimeline(timeline);
      continueRender(handle);
    };

    fetchConfig();

    return () => {
      continueRender(handle);
    };
  }, [timelineFile]);

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
            const elementStartFrame = (element.startMs * FPS) / 1000;
            const durationInFrames =
              ((element.endMs - element.startMs) * FPS) / 1000 +
              (index === 0 ? IntoFrameDuration : 0);

            return (
              <Sequence
                key={`element-${index}`}
                from={elementStartFrame}
                durationInFrames={durationInFrames}
              >
                <Background item={element} />
              </Sequence>
            );
          })}

          {timeline.text.map((element, index) => {
            const elementStartFrame =
              (element.startMs * FPS) / 1000 + IntoFrameDuration;
            const durationInFrames =
              ((element.endMs - element.startMs) * FPS) / 1000;

            return (
              <Sequence
                key={`element-${index}`}
                from={elementStartFrame}
                durationInFrames={durationInFrames}
              >
                <Subtitle key={index} text={element.text} />;
              </Sequence>
            );
          })}

          {timeline.audio.map((element, index) => {
            const elementStartFrame =
              (element.startMs * FPS) / 1000 + IntoFrameDuration;
            const durationInFrames =
              ((element.endMs - element.startMs) * FPS) / 1000;

            return (
              <Sequence
                key={`element-${index}`}
                from={elementStartFrame}
                durationInFrames={durationInFrames}
              >
                <Html5Audio src={element.audioUrl} />
              </Sequence>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
