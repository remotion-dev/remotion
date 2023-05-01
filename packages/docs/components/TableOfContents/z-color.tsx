import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/z-color/z-color">
          <strong>{"zColor()"}</strong>
          <div>A Zod Type for colors</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
