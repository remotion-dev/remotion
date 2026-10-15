import { Composition } from "remotion";
import { ElementPreview } from "./ElementPreview";

// Keep registrations and defaultProps explicit so Studio can locate and save
// edits. Match the preview metadata in elements/registry.ts.
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
    </>
  );
};
