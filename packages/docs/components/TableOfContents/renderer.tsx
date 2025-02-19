import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  const offthreadComponent = "<OffthreadVideo>";
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/renderer/get-compositions">
          <strong>getCompositions()</strong>
          <div>List available compositions</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/select-composition">
          <strong>selectComposition()</strong>
          <div>Get a composition</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/render-media">
          <strong>renderMedia()</strong>
          <div>Render a video or audio</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/render-frames">
          <strong>renderFrames()</strong>
          <div>Render a series of images</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/render-still">
          <strong>renderStill()</strong>
          <div>Render a single image</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/stitch-frames-to-video">
          <strong>stitchFramesToVideo()</strong>
          <div>Turn images into a video</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/open-browser">
          <strong>openBrowser()</strong>
          <div>Open a Chrome browser to reuse across renders</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/ensure-browser">
          <strong>ensureBrowser()</strong>
          <div>Open a Chrome browser to reuse across renders</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/make-cancel-signal">
          <strong>makeCancelSignal()</strong>
          <div>Create token to later cancel a render</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/get-video-metadata">
          <strong>getVideoMetadata()</strong>
          <div>Get metadata from a video file in Node.js</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/get-silent-parts">
          <strong>getSilentParts()</strong>
          <div>Obtain silent portions of a video or audio</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/ensure-ffmpeg">
          <strong style={{ textDecoration: "line-through" }}>
            ensureFfmpeg()
          </strong>
          <div>Check for ffmpeg binary and install if not existing</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/ensure-ffprobe">
          <strong style={{ textDecoration: "line-through" }}>
            ensureFfprobe()
          </strong>
          <div>Check for ffprobe binary and install if not existing</div>
        </TOCItem>
        <TOCItem link="/docs/renderer/get-can-extract-frames-fast">
          <strong style={{ textDecoration: "line-through" }}>
            getCanExtractFramesFast()
          </strong>
          <div>Probes for fast extraction for {offthreadComponent}</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
