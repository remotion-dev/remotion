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
        <TOCItem link="/docs/animation-utils/use-interpolate-styles">
          <strong>useInterpolateStyles()</strong>
          <div>
            React hook to interpolate styles based on the current frame.
          </div>
        </TOCItem>
      </Grid>
    </div>
  );
};
