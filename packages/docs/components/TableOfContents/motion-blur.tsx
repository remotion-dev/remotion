import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/motion-blur/motion-blur">
          <strong>{"<MotionBlur>"}</strong>
          <div>Add a motion blur effect to children</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
