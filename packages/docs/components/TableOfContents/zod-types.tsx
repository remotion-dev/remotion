import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/zod-types/z-color">
          <strong>{"zColor()"}</strong>
          <div>A Zod Type for colors</div>
        </TOCItem>
        <TOCItem link="/docs/zod-types/z-textarea">
          <strong>{"zTextarea()"}</strong>
          <div>A Zod Type for multiple-line text in a textarea</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
