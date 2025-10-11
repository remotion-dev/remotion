import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/bundle">
          <strong>{"bundle()"}</strong>
          <div>Create a Webpack bundle</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
