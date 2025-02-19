import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/fonts-api/load-font">
          <strong>{"loadFont()"}</strong>
          <div>Load a font from a URL or a local file</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
