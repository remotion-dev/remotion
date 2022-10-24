import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/noise/noise-2d">
          <strong>noise2D()</strong>
          <div>Create 2D noise</div>
        </TOCItem>
        <TOCItem link="/docs/noise/noise-3d">
          <strong>noise3D()</strong>
          <div>Create 3D noise</div>
        </TOCItem>
        <TOCItem link="/docs/noise/noise-4d">
          <strong>noise4D()</strong>
          <div>Create 4D noise</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
