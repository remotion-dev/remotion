import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/studio/get-static-files">
          <strong>{"getStaticFiles()"}</strong>
          <div>
            Get a list of files in the <code>public</code> folder
          </div>
        </TOCItem>
        <TOCItem link="/docs/studio/watch-static-file">
          <strong>{"watchStaticFile()"}</strong>
          <div>Listen to changes of a static file</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
