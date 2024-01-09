import React from "react";
import { PresentationPreview } from "../../transitions/previews";
import { useImport } from "../../transitions/use-import";
import { Grid } from "../Grid";
import { TOCItem } from "../TOCItem";

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
};

export const presentationCompositionWidth = 540;
export const presentationCompositionHeight = 280;

export const Presentations: React.FC = () => {
  const fade = useImport(import("@remotion/transitions/fade"));
  const wipe = useImport(import("@remotion/transitions/wipe"));
  const flip = useImport(import("@remotion/transitions/flip"));
  const clockWipe = useImport(import("@remotion/transitions/clock-wipe"));
  const slide = useImport(import("@remotion/transitions/slide"));

  if (!fade || !wipe || !flip || !clockWipe || !slide) {
    return null;
  }

  return (
    <Grid>
      <TOCItem link="/docs/transitions/presentations">
        <strong>{"Overview"}</strong>
        <div>List of available presentations</div>
      </TOCItem>
      <TOCItem link="/docs/transitions/presentations/custom">
        <strong>Custom presentations</strong>
        <div>Implement your own effect</div>
      </TOCItem>
      <TOCItem link="/docs/transitions/presentations/fade">
        <div style={row}>
          <PresentationPreview
            durationRestThreshold={0.001}
            effect={fade.fade()}
          />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <strong>
              <code>{"fade()"}</code>
            </strong>
            <div>Animate the opacity of the scenes</div>
          </div>
        </div>
      </TOCItem>
      <TOCItem link="/docs/transitions/presentations/slide">
        <div style={row}>
          <PresentationPreview
            durationRestThreshold={0.001}
            effect={slide.slide()}
          />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <strong>
              <code>{"slide()"}</code>
            </strong>
            <div>Slide in and push out the previous scene</div>
          </div>
        </div>
      </TOCItem>
      <TOCItem link="/docs/transitions/presentations/wipe">
        <div style={row}>
          <PresentationPreview
            durationRestThreshold={0.001}
            effect={wipe.wipe()}
          />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <strong>
              <code>{"wipe()"}</code>
            </strong>
            <div>Slide over the previous scene</div>
          </div>
        </div>
      </TOCItem>
      <TOCItem link="/docs/transitions/presentations/flip">
        <div style={row}>
          <PresentationPreview
            durationRestThreshold={0.001}
            effect={flip.flip()}
          />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <strong>
              <code>{"flip()"}</code>
            </strong>
            <div>Rotate the previous scene</div>
          </div>
        </div>
      </TOCItem>
      <TOCItem link="/docs/transitions/presentations/clock-wipe">
        <div style={row}>
          <PresentationPreview
            durationRestThreshold={0.001}
            effect={clockWipe.clockWipe({
              width: presentationCompositionWidth,
              height: presentationCompositionHeight,
            })}
          />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <strong>
              <code>{"clockWipe()"}</code>
            </strong>
            <div>Reveal the new scene in a circular movement</div>
          </div>
        </div>
      </TOCItem>
      <TOCItem link="/docs/transitions/audio-transitions">
        <div style={row}>
          <div style={{ flex: 1 }}>
            <strong>Audio transitions</strong>
            <div>Add a sound effect to a transition</div>
          </div>
        </div>
      </TOCItem>
    </Grid>
  );
};
