import { Sequence } from "remotion";
import { elements } from "../elements/registry";
import { AnimatedTitle } from "../elements/animated-title/animated-title";
import { LowerThird } from "../elements/lower-third/lower-third";
import { AnimatedBackground } from "../elements/animated-background/animated-background";
import { AccentCaptions } from "../elements/accent-captions/accent-captions";

const components = new Map(
  Object.entries({
    "animated-title": AnimatedTitle,
    "lower-third": LowerThird,
    "animated-background": AnimatedBackground,
    "accent-captions": AccentCaptions,
  }),
);

export const ElementPreview = ({ slug }: { slug: string }) => {
  const definition = elements.find((element) => element.slug === slug);
  const Component = components.get(slug);

  if (!definition || !Component) {
    throw new Error(`Unknown Element: ${slug}`);
  }

  const dimensions = definition.dimensions;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: definition.previewBackground,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {dimensions ? (
        <Sequence
          layout="none"
          width={dimensions.width}
          height={dimensions.height}
          durationInFrames={definition.durationInFrames}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            <Component {...(definition.initialProps ?? {})} />
          </div>
        </Sequence>
      ) : (
        <Component {...(definition.initialProps ?? {})} />
      )}
    </div>
  );
};
