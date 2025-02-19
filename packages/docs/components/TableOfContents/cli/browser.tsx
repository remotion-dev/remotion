import React from "react";
import { Grid } from "../Grid";
import { TOCItem } from "../TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/cli/browser/ensure">
          <strong>browser ensure</strong>
          <div>Ensure Remotion has a browser to render</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
