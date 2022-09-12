import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/preload/preload-video">
          <strong>preloadVideo()</strong>
          <div>Preload a video source</div>
        </TOCItem>
        <TOCItem link="/docs/preload/preload-audio">
          <strong>preloadAudio()</strong>
          <div>Preload an audio source</div>
        </TOCItem>
        <TOCItem link="/docs/preload/preload-audio">
          <strong>resolveRedirect()</strong>
          <div>Get the definitive URL after all redirects</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
