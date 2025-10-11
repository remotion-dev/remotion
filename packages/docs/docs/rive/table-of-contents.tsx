import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

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
