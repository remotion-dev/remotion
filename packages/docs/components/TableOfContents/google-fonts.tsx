import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/google-fonts/load-font">
          <strong>loadFont()</strong>
          <div>Load a Google Font</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
