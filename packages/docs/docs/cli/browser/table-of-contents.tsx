import React from "react";
import { Grid } from "../../../components/TableOfContents/Grid";
import { TOCItem } from "../../../components/TableOfContents/TOCItem";

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