import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/shapes/make-circle">
          <strong>makeCircle()</strong>
          <div>Generate circle path</div>
        </TOCItem>
        <TOCItem link="/docs/shapes/make-square">
          <strong>makeSquare()</strong>
          <div>Generate circle path</div>
        </TOCItem>
        <TOCItem link="/docs/shapes/make-square">
          <strong>makeTriangle()</strong>
          <div>Generate triangle path</div>
        </TOCItem>
        <TOCItem link="/docs/shapes/circle">
          <strong>{`<Circle/>`}</strong>
          <div>Generates Circle SVG</div>
        </TOCItem>
        <TOCItem link="/docs/shapes/square">
          <strong>{`<Square/>`}</strong>
          <div>Generates Square SVG</div>
        </TOCItem>
        <TOCItem link="/docs/shapes/triangle">
          <strong>{`<Triangle/>`}</strong>
          <div>Generates Triangle SVG</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
