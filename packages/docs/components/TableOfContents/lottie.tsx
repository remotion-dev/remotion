import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents = () => {
  return (
    <div>
      <Grid>
        <h1>Functions</h1>
        <TOCItem link="/docs/lottie/getlottiemetadata">
          <strong>getLottieMetadata()</strong>
          <div>Get metadata of a Lottie animation</div>
        </TOCItem>
        <TOCItem link="/docs/staticfile">
          <strong>staticFile()</strong>
          <div>Load Lottie animations from a static file</div>
        </TOCItem>
        <TOCItem link="/docs/lottie/remote">
          <div>Loading Lottie animations from a remote URL</div>
        </TOCItem>
        <TOCItem link="/docs/lottie/lottiefiles">
          <div>Where to find Lottie files</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
