import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/paths/get-length">
          <strong>getLength()</strong>
          <div>Obtain length of an SVG path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/get-point-at-length">
          <strong>getPointAtLength()</strong>
          <div>Get coordinates at a certain point of an SVG path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/get-tangent-at-length">
          <strong>getTangentAtLength()</strong>
          <div>
            Gets tangents <code>x</code> and <code>y</code> of a point which is
            on an SVG path
          </div>
        </TOCItem>
        <TOCItem link="/docs/paths/reverse-path">
          <strong>reversePath()</strong>
          <div>Switch direction of an SVG path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/normalize-path">
          <strong>normalizePath()</strong>
          <div>Replace relative with absolute coordinates</div>
        </TOCItem>
        <TOCItem link="/docs/paths/interpolate-path">
          <strong>interpolatePath()</strong>
          <div>Interpolates between two SVG paths</div>
        </TOCItem>
        <TOCItem link="/docs/paths/evolve-path">
          <strong>evolvePath()</strong>
          <div>Animate an SVG path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/translate-path">
          <strong>translatePath()</strong>
          <div>Translates the position of an path against X/Y coordinates</div>
        </TOCItem>
        <TOCItem link="/docs/paths/warp-path">
          <strong>warpPath()</strong>
          <div>Remap the coordinates of a path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/scale-path">
          <strong>scalePath()</strong>
          <div>Grow or shrink the size of the path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/get-bounding-box">
          <strong>getBoundingBox()</strong>
          <div>Get the bounding box of a SVG path</div>
        </TOCItem>
        <TOCItem link="/docs/paths/reset-path">
          <strong>resetPath()</strong>
          <div>
            Translates an SVG path to <code>(0, 0)</code>
          </div>
        </TOCItem>
        <TOCItem link="/docs/paths/extend-viewbox">
          <strong>extendViewBox()</strong>
          <div>Widen an SVG viewBox in all directions</div>
        </TOCItem>
        <TOCItem link="/docs/paths/get-subpaths">
          <strong>getSubpaths()</strong>
          <div>Split SVG path into its parts</div>
        </TOCItem>
        <TOCItem link="/docs/paths/parse-path">
          <strong>parsePath()</strong>
          <div>Parse a string into an array of instructions</div>
        </TOCItem>
        <TOCItem link="/docs/paths/serialize-instructions">
          <strong>serializeInstructions()</strong>
          <div>Turn an array of instructions into a SVG path</div>
        </TOCItem>{" "}
        <TOCItem link="/docs/paths/reduce-instructions">
          <strong>reduceInstructions()</strong>
          <div>Reduce the amount of instruction types</div>
        </TOCItem>{" "}
      </Grid>
    </div>
  );
};
