import { Player } from "@remotion/player";
import { useMemo } from "react";
import type { ElementDefinition } from "../../elements/registry";
import { ElementPreview as PreviewComposition } from "../../remotion/ElementPreview";

export const ElementPreview = ({
  definition,
}: {
  definition: ElementDefinition;
}) => {
  const inputProps = useMemo(
    () => ({ slug: definition.slug }),
    [definition.slug],
  );

  const style = {
    width: "100%",
    "--preview-background": definition.previewBackground,
  };

  return (
    <Player
      component={PreviewComposition}
      inputProps={inputProps}
      compositionWidth={definition.width}
      compositionHeight={definition.height}
      durationInFrames={definition.durationInFrames}
      fps={definition.fps}
      initialFrame={definition.posterFrame}
      controls
      loop
      className="bg-(--preview-background)"
      style={style}
    />
  );
};
