import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/noise/create-noise-2d">
          <strong>createNoise2d()</strong>
          <div>Create 2D noise</div>
        </TOCItem>
        <TOCItem link="/docs/noise/create-noise-3d">
          <strong>createNoise3d()</strong>
          <div>Create 3D noise</div>
        </TOCItem>
        <TOCItem link="/docs/noise/create-noise-4d">
          <strong>createNoise4d()</strong>
          <div>Create 4D noise</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
