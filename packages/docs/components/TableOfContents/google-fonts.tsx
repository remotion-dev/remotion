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
        <TOCItem link="/docs/google-fonts/get-available-fonts">
          <strong>getAvailableFonts()</strong>
          <div>Static list of available fonts</div>
        </TOCItem>
        <TOCItem link="/docs/google-fonts/get-info">
          <strong>getInfo()</strong>
          <div>Metadata about a specific font</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
