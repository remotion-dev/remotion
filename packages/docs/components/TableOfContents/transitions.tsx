import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

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
        <TOCItem link="/docs/transitions/timings/custom">
          <strong>Custom timings</strong>
          <div>Implement your own timing</div>
        </TOCItem>
      </Grid>
      <h3>Presentations</h3>
      <Grid>
        <TOCItem link="/docs/transitions/presentations">
          <strong>{"Overview"}</strong>
          <div>List of available presentations</div>
        </TOCItem>
        <TOCItem link="/docs/transitions/presentations/fade">
          <strong>
            <code>{"fade()"}</code>
          </strong>
          <div>Animate the opacity of the scenes</div>
        </TOCItem>
        <TOCItem link="/docs/transitions/presentations/slide">
          <strong>
            <code>{"slide()"}</code>
          </strong>
          <div>Slide in and push out the previous scene</div>
        </TOCItem>
        <TOCItem link="/docs/transitions/presentations/wipe">
          <strong>
            <code>{"wipe()"}</code>
          </strong>
          <div>Slide over the previous scene</div>
        </TOCItem>
        <TOCItem link="/docs/transitions/presentations/custom">
          <strong>Custom presentations</strong>
          <div>Implement your own effect</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
