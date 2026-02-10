import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/light-leaks/light-leak">
          <strong>{"<LightLeak>"}</strong>
          <div>Render a light leak effect</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
