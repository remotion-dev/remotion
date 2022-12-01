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
        <TOCItem link="/docs/paths/get-parts">
          <strong
            style={{
              textDecoration: "line-through",
            }}
          >
            getParts()
          </strong>
          <div>Split SVG path into its parts</div>
        </TOCItem>
        <TOCItem link="/docs/paths/get-tangent-at-length">
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
        <TOCItem link="/docs/paths/extend-viewbox">
          <strong>extendViewBox()</strong>
          <div>Widen an SVG viewBox in all directions</div>
        </TOCItem>
        <TOCItem link="/docs/paths/get-subpaths">
          <strong>getSubpaths()</strong>
          <div>Split SVG path into its parts</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
