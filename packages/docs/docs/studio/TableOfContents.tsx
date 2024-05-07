import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

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
        <TOCItem link="/docs/studio/write-static-file">
          <strong>{"writeStaticFile()"}</strong>
          <div>Save content to a file in the public directory</div>
        </TOCItem>
        <TOCItem link="/docs/studio/save-default-props">
          <strong>{"saveDefaultProps()"}</strong>
          <div>Save default props to the root file</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
