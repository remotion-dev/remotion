import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { Preview } from "../transitions/previews";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
};

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <h3>Components</h3>
      <Grid>
        <TOCItem link="/docs/transitions/transitionseries">
          <strong>
            <code>{"<TransitionSeries>"}</code>
          </strong>
          <div>
            A <code>{"<Series>"}</code> with transitions inbetween
          </div>
        </TOCItem>
      </Grid>
      <h3>Timings</h3>
      <Grid>
        <TOCItem link="/docs/transitions/timings">
          <strong>{"Overview"}</strong>
          <div>List of available timings</div>
        </TOCItem>
        <TOCItem link="/docs/transitions/timings/custom">
          <strong>Custom timings</strong>
          <div>Implement your own timing</div>
        </TOCItem>
        <TOCItem link="/docs/transitions/timings/springtiming">
          <strong>
            <code>{"springTiming()"}</code>
          </strong>
          <div>
            Transition with a <code>spring()</code>
          </div>
        </TOCItem>
        <TOCItem link="/docs/transitions/timings/lineartiming">
          <strong>
            <code>{"linearTiming()"}</code>
          </strong>
          <div>Transition linearly with optional Easing</div>
        </TOCItem>
      </Grid>
      <h3>Presentations</h3>
      <p>Hover over an effect to see the preview.</p>
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
            <Preview effect={fade()} />
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
            <Preview effect={slide()} />
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
            <Preview effect={wipe()} />
            <div style={{ flex: 1, marginLeft: 10 }}>
              <strong>
                <code>{"wipe()"}</code>
              </strong>
              <div>Slide over the previous scene</div>
            </div>
          </div>
        </TOCItem>
      </Grid>
    </div>
  );
};
