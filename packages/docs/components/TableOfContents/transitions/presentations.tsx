import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { PresentationPreview } from "../../transitions/previews";
import { Grid } from "../Grid";
import { TOCItem } from "../TOCItem";

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
};

export const Presentations: React.FC = () => {
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
          <PresentationPreview durationRestThreshold={0.001} effect={fade()} />
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
          <PresentationPreview durationRestThreshold={0.001} effect={slide()} />
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
          <PresentationPreview durationRestThreshold={0.001} effect={wipe()} />
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
          <PresentationPreview durationRestThreshold={0.001} effect={flip()} />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <strong>
              <code>{"flip()"}</code>
            </strong>
            <div>Rotate the previous scene</div>
          </div>
        </div>
      </TOCItem>
    </Grid>
  );
};
