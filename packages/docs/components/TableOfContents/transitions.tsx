import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/transitions/transitionseries">
          <strong>{"<TransitionSeries>"}</strong>
          <div>
            A <code>{"<Series>"}</code> with transitions inbetween
          </div>
        </TOCItem>
      </Grid>
    </div>
  );
};
