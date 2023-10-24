import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/layout-utils/measure-text">
          <strong>measureText()</strong>
          <div>Get dimensions of text</div>
        </TOCItem>
        <TOCItem link="/docs/layout-utils/fill-text-box">
          <strong>fillTextBox()</strong>
          <div>Calculate text is fill the box</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
