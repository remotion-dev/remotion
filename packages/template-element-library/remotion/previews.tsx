import { Composition, registerRoot } from "remotion";
import { elements } from "../elements/registry";
import { ElementPreview } from "./ElementPreview";

registerRoot(() => (
  <>
    {elements.map((element) => (
      <Composition
        key={element.slug}
        id={element.slug}
        component={ElementPreview}
        width={element.width}
        height={element.height}
        fps={element.fps}
        durationInFrames={element.durationInFrames}
        defaultProps={{ slug: element.slug }}
      />
    ))}
  </>
));
