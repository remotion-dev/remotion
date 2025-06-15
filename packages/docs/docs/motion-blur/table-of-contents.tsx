import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/motion-blur/trail">
          <strong>{"<Trail>"}</strong>
          <div>Add a trail effect to children</div>
        </TOCItem>
        <TOCItem link="/docs/motion-blur/camera-motion-blur">
          <strong>{"<CameraMotionBlur>"}</strong>
          <div>Add a natural camera motion blur effect to children</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
