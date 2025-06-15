import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/animation-utils/make-transform">
          <strong>makeTransform()</strong>
          <div>
            Create a value for the CSS <code>transform</code> property
          </div>
        </TOCItem>
        <TOCItem link="/docs/animation-utils/interpolate-styles">
          <strong>interpolateStyles()</strong>
          <div>
            Map a range of values to CSS <code>style</code> values
          </div>
        </TOCItem>
      </Grid>
    </div>
  );
};
