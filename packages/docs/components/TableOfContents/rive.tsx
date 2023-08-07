import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/rive/remotionrivecanvas">
          <strong>{"<RemotionRiveCanvas>"}</strong>
          <div>Render a Rive animation</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
