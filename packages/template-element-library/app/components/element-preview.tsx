import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { ElementDefinition } from "../../elements/registry";
import { ElementPreview as PreviewComposition } from "../../remotion/ElementPreview";

export const ElementPreview = ({
  definition,
  controls,
  playing,
}: {
  definition: ElementDefinition;
  controls: boolean;
  playing: boolean;
}) => {
  const player = useRef<PlayerRef>(null);
  const inputProps = useMemo(
    () => ({ slug: definition.slug }),
    [definition.slug],
  );

  useEffect(() => {
    if (controls) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (playing && !preference.matches) {
        player.current?.seekTo(0);
        player.current?.play();
      } else {
        player.current?.pause();
        player.current?.seekTo(definition.posterFrame);
      }
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [controls, playing, definition.posterFrame]);

  return (
    <Player
      ref={player}
      component={PreviewComposition}
      inputProps={inputProps}
      compositionWidth={definition.width}
      compositionHeight={definition.height}
      durationInFrames={definition.durationInFrames}
      fps={definition.fps}
      initialFrame={definition.posterFrame}
      controls={controls}
      clickToPlay={controls}
      doubleClickToFullscreen={controls}
      spaceKeyToPlayOrPause={controls}
      loop
      className="bg-(--preview-background)"
      // Player reads style.width to calculate the composition's preview scale.
      style={
        {
          width: "100%",
          "--preview-background": definition.previewBackground,
        } as CSSProperties
      }
    />
  );
};
