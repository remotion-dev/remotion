import Link from "@docusaurus/Link";
import React from "react";
import styles from "./toc.module.css";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <div className={styles.containerrow}>
        <Link to="/docs/cli" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>Command line</strong>
              <div>
                Reference for the <code>npx remotion</code> commands
              </div>
            </div>
          </div>
        </Link>
        <Link to="/docs/config" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>Configuration file</strong>
              <div>
                Reference for the <code>remotion.config.ts</code> file
              </div>
            </div>
          </div>
        </Link>
      </div>
      <h2>Packages</h2>
      <div className={styles.containerrow}>
        <Link to="/docs/use-current-frame" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>remotion</strong>
              <div>
                Core APIs: <code>useCurrentFrame()</code>,{" "}
                <code>interpolate()</code>, etc.
              </div>
            </div>
          </div>
        </Link>
        <Link to="/docs/bundle" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/bundler</strong>
              <div>Create a Webpack bundle from Node.JS</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/gif" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/gif</strong>
              <div>Include a GIF in your video</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/media-utils" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/media-utils</strong>
              <div>Obtain info about video and audio</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/lambda" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/lambda</strong>
              <div>Render videos and stills on AWS Lambda</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/player" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/player</strong>
              <div>Play a Remotion video in the browser</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/three" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/three</strong>
              <div>Create 3D videos using React Three Fiber</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/skia" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/skia</strong>
              <div>Low-level graphics using React Native Skia</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/lottie" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/lottie</strong>
              <div>Include a Lottie animation in your video</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/preload" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/preload</strong>
              <div>Preload video and audio in the Player</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/renderer" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/renderer</strong>
              <div>Render video, audio and stills from Node.JS</div>
            </div>
          </div>
        </Link>
        <Link to="/docs/paths" className={styles.link}>
          <div className={styles.item}>
            <div>
              <strong>@remotion/paths</strong>
              <div>Manipulate and obtain info about SVG paths</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
