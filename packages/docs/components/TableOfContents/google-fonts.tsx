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
        <TOCItem link="/docs/google-fonts/available-fonts">
          <strong>availableFonts</strong>
          <div>Static list of available fonts</div>
        </TOCItem>
        <TOCItem link="/docs/google-fonts/info">
          <strong>info</strong>
          <div>Metadata about a specific font</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
