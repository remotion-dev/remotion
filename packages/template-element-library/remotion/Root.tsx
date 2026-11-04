import { Composition } from "remotion";
import { AccentCaptions } from "../elements/accent-captions/accent-captions";
import { ElementPreview } from "./ElementPreview";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="animated-title"
        component={ElementPreview}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={150}
        defaultProps={{ slug: "animated-title" }}
      />
      <Composition
        id="lower-third"
        component={ElementPreview}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={150}
        defaultProps={{ slug: "lower-third" }}
      />
      <Composition
        id="animated-background"
        component={ElementPreview}
        width={1280}
        height={720}
        fps={30}
        durationInFrames={150}
        defaultProps={{ slug: "animated-background" }}
      />
      <Composition
        id="accent-captions"
        component={AccentCaptions}
        width={900}
        height={300}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          captions: [
            {
              text: "Make",
              startMs: 0,
              endMs: 600,
              timestampMs: 300,
              confidence: null,
            },
            {
              text: " every",
              startMs: 600,
              endMs: 1300,
              timestampMs: 950,
              confidence: null,
            },
            {
              text: " word",
              startMs: 1300,
              endMs: 2100,
              timestampMs: 1700,
              confidence: null,
            },
            {
              text: " count.",
              startMs: 2100,
              endMs: 3000,
              timestampMs: 2550,
              confidence: null,
              pageBreakAfter: true,
            },
            {
              text: "Keep",
              startMs: 3000,
              endMs: 3600,
              timestampMs: 3300,
              confidence: null,
            },
            {
              text: " it",
              startMs: 3600,
              endMs: 4000,
              timestampMs: 3800,
              confidence: null,
            },
            {
              text: " moving.",
              startMs: 4000,
              endMs: 5000,
              timestampMs: 4500,
              confidence: null,
            },
          ],
          width: 900,
          combineTokensWithinMilliseconds: 3000,
          highlightColor: "#ffb27d",
          style: { height: "100%" },
        }}
      />
    </>
  );
};
