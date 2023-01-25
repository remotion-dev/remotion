import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/player/player">
          <strong>{"<Player>"}</strong>
          <div>Embed a Remotion composition in a webapp</div>
        </TOCItem>
        <TOCItem link="/docs/player/thumbnail">
          <strong>{"<Thumbnail>"}</strong>
          <div>Embed a still in a webapp</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
