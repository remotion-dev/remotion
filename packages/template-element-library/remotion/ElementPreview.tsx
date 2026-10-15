import { Sequence } from "remotion";
import { elements } from "../elements/registry";

// The preview stage is deliberately not part of the installable source.
export const ElementPreview = ({ slug }: { slug: string }) => {
  const definition = elements.find((element) => element.slug === slug);
  if (!definition) {
    throw new Error(`Unknown Element: ${slug}`);
  }
  const Component = definition.component;
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
