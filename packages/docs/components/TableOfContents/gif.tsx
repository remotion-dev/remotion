import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/gif/gif">
          <strong>{"<Gif>"}</strong>
          <div>Render a GIF</div>
        </TOCItem>
        <TOCItem link="/docs/gif/get-gif-duration-in-seconds">
          <strong>getGifDurationInSeconds()</strong>
          <div>Get the runtime of a GIF</div>
        </TOCItem>
        <TOCItem link="/docs/gif/preload-gif">
          <strong>preloadGif()</strong>
          <div>Prepare a GIF for displaying in the Player</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
