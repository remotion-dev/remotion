import React from "react";
import { shapeComponents } from "../../components/shapes/shapes-info";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        {shapeComponents.map((c) => {
          return (
            <React.Fragment key={c.shape}>
              <TOCItem link={"/docs/shapes/make-" + c.shape.toLowerCase()}>
                <strong>make{c.shape}()</strong>
                <div>Generate SVG Path for a {c.shape.toLowerCase()}</div>
              </TOCItem>
              <TOCItem link={"/docs/shapes/" + c.shape.toLowerCase()}>
                <strong>{"<" + c.shape + "/>"}</strong>
                <div>Render a {c.shape.toLowerCase()}</div>
              </TOCItem>
            </React.Fragment>
          );
        })}
      </Grid>
    </div>
  );
};
