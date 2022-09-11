import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/cli">
          <strong>Command line</strong>
          <div>
            Reference for the <code>npx remotion</code> commands
          </div>
        </TOCItem>
        <TOCItem link="/docs/config">
          <strong>Configuration file</strong>
          <div>
            Reference for the <code>remotion.config.ts</code> file
          </div>
        </TOCItem>
      </Grid>
      <h2>Packages</h2>
      <Grid>
        <TOCItem link="/docs/remotion">
          <strong>remotion</strong>
          <div>
            Core APIs: <code>useCurrentFrame()</code>,{" "}
            <code>interpolate()</code>, etc.
          </div>
        </TOCItem>
        <TOCItem link="/docs/bundler">
          <strong>@remotion/bundler</strong>
          <div>Create a Webpack bundle from Node.JS</div>
        </TOCItem>
        <TOCItem link="/docs/gif">
          <strong>@remotion/gif</strong>
          <div>Include a GIF in your video</div>
        </TOCItem>
        <TOCItem link="/docs/media-utils">
          <strong>@remotion/media-utils</strong>
          <div>Obtain info about video and audio</div>
        </TOCItem>
        <TOCItem link="/docs/lambda">
          <strong>@remotion/lambda</strong>
          <div>Render videos and stills on AWS Lambda</div>
        </TOCItem>
        <TOCItem link="/docs/player">
          <strong>@remotion/player</strong>
          <div>Play a Remotion video in the browser</div>
        </TOCItem>
        <TOCItem link="/docs/three">
          <strong>@remotion/three</strong>
          <div>Create 3D videos using React Three Fiber</div>
        </TOCItem>
        <TOCItem link="/docs/skia">
          <strong>@remotion/skia</strong>
          <div>Low-level graphics using React Native Skia</div>
        </TOCItem>
        <TOCItem link="/docs/lottie">
          <strong>@remotion/lottie</strong>
          <div>Include a Lottie animation in your video</div>
        </TOCItem>
        <TOCItem link="/docs/preload">
          <strong>@remotion/preload</strong>
          <div>Preload video and audio in the Player</div>
        </TOCItem>
        <TOCItem link="/docs/renderer">
          <strong>@remotion/renderer</strong>
          <div>Render video, audio and stills from Node.JS</div>
        </TOCItem>
        <TOCItem link="/docs/paths">
          <strong>@remotion/paths</strong>
          <div>Manipulate and obtain info about SVG paths</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
