import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/animation-utils/make-transform">
          <strong>makeTransform()</strong>
          <div>
            Type-safe function to create string for the transform CSS property
          </div>
        </TOCItem>
        <TOCItem link="/docs/animation-utils/interpolate-styles">
          <strong>interpolateStyles()</strong>
          <div>Map a range of values to Styles</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
