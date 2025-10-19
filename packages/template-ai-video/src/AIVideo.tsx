import { AbsoluteFill, Html5Audio, Sequence } from "remotion";
import { z } from "zod";
import { TimelineSchema } from "./types";
import { FirstFrameOffset, FPS } from "./constants";
import { loadFont } from "@remotion/google-fonts/Signika";
import { Background } from "./components/Background";
import Subtitle from "./components/Subtitle";

export const aiVideoSchema = z.object({
  timeline: TimelineSchema,
  hasWatermark: z.boolean().optional(),
});

export const AIVideo: React.FC<z.infer<typeof aiVideoSchema>> = ({
  timeline,
}) => {
  const { fontFamily } = loadFont();
  const ready = true;

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {ready && timeline && (
        <>
          <Sequence durationInFrames={FirstFrameOffset}>
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
              (index === 0 ? FirstFrameOffset : 0);

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
              (element.startMs * FPS) / 1000 + FirstFrameOffset;
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
              (element.startMs * FPS) / 1000 + FirstFrameOffset;
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
