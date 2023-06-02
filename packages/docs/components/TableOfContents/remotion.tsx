import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <h2>Defining compositions</h2>
      <p>Declare renderable assets.</p>
      <Grid>
        <TOCItem link="/docs/composition">
          <strong>{"<Composition>"}</strong>
          <div>Define a video</div>
        </TOCItem>
        <TOCItem link="/docs/still">
          <strong>{"<Still>"}</strong>
          <div>Define a still</div>
        </TOCItem>
        <TOCItem link="/docs/folder">
          <strong>{"<Folder>"}</strong>
          <div>Organize compositions in the Studio sidebar</div>
        </TOCItem>
        <TOCItem link="/docs/register-root">
          <strong>{"registerRoot()"}</strong>
          <div>Initialize a Remotion project</div>
        </TOCItem>
      </Grid>
      <h2>Hooks</h2>
      <p>To be used inside a composition.</p>
      <Grid>
        <TOCItem link="/docs/use-current-frame">
          <strong>useCurrentFrame()</strong>
          <div>Obtain the current time</div>
        </TOCItem>
        <TOCItem link="/docs/use-video-config">
          <strong>useVideoConfig()</strong>
          <div>Get the duration, dimensions and FPS of a composition</div>
        </TOCItem>
      </Grid>
      <h2>Animations</h2>
      <Grid>
        <TOCItem link="/docs/interpolate">
          <strong>interpolate()</strong>
          <div>Map a range of values to another</div>
        </TOCItem>
        <TOCItem link="/docs/spring">
          <strong>spring()</strong>
          <div>Physics-based animation primitive</div>
        </TOCItem>
        <TOCItem link="/docs/interpolate-colors">
          <strong>interpolateColors()</strong>
          <div>Map a range of values to colors</div>
        </TOCItem>
        <TOCItem link="/docs/interpolate-colors">
          <strong>measureSpring()</strong>
          <div>Determine the duration of a spring</div>
        </TOCItem>
        <TOCItem link="/docs/easing">
          <strong>Easing</strong>
          <div>
            Customize animation curve of <code>interpolate()</code>
          </div>
        </TOCItem>
      </Grid>
      <h2>Media</h2>
      <Grid>
        <TOCItem link="/docs/img">
          <strong>{"<Img>"}</strong>
          <div>
            Render an <code>{"<img>"}</code> tag and wait for it to load
          </div>
        </TOCItem>
        <TOCItem link="/docs/video">
          <strong>{"<Video>"}</strong>
          <div>
            Synchronize a <code>{"<video>"}</code> with Remotion{"'"}s time
          </div>
        </TOCItem>
        <TOCItem link="/docs/audio">
          <strong>{"<Audio>"}</strong>
          <div>
            Synchronize <code>{"<audio>"}</code> with Remotion{"'"}s time
          </div>
        </TOCItem>
        <TOCItem link="/docs/offthreadvideo">
          <strong>{"<OffthreadVideo>"}</strong>
          <div>
            Alternative to <code>{"<Video>"}</code>
          </div>
        </TOCItem>
        <TOCItem link="/docs/iframe">
          <strong>{"<IFrame>"}</strong>
          <div>
            Render an <code>{"<iframe>"}</code> tag and wait for it to load
          </div>
        </TOCItem>
      </Grid>

      <h2>Timing</h2>
      <Grid>
        <TOCItem link="/docs/sequence">
          <strong>{"<Sequence>"}</strong>
          <div>Time-shifts it{"'"}s children</div>
        </TOCItem>
        <TOCItem link="/docs/series">
          <strong>{"<Series>"}</strong>
          <div>Display contents after another</div>
        </TOCItem>
        <TOCItem link="/docs/freeze">
          <strong>{"<Freeze>"}</strong>
          <div>Freeze some content in time</div>
        </TOCItem>
        <TOCItem link="/docs/loop">
          <strong>{"<Loop>"}</strong>
          <div>Play some content repeatedly</div>
        </TOCItem>
      </Grid>
      <h2>Async</h2>
      <Grid>
        <TOCItem link="/docs/delay-render">
          <strong>delayRender()</strong>
          <div>Block a render from continuing</div>
        </TOCItem>
        <TOCItem link="/docs/continue-render">
          <strong>continueRender()</strong>
          <div>Unblock a render</div>
        </TOCItem>
      </Grid>
      <h2>Dynamic data</h2>
      <Grid>
        <TOCItem link="/docs/get-input-props">
          <strong>getInputProps()</strong>
          <div>Receive the user-defined input data</div>
        </TOCItem>
      </Grid>
      <h2>Assets</h2>
      <Grid>
        <TOCItem link="/docs/staticfile">
          <strong>staticFile()</strong>
          <div>
            Access file from <code>public{"/"}</code> folder
          </div>
        </TOCItem>
      </Grid>
      <h2>Layout</h2>
      <Grid>
        <TOCItem link="/docs/absolute-fill">
          <strong>{"<AbsoluteFill>"}</strong>
          <div>Position content absolutely and in full size</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
