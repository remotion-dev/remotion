import {
  makeCircle,
  makeEllipse,
  makeRect,
  makeTriangle,
} from "@remotion/shapes";
import React from "react";

export const shapeComponents = [
  {
    shape: "Rect",
    name: "<Rect>",
    fn: makeRect,
  },
  {
    shape: "Circle",
    name: "<Circle>",
    fn: makeCircle,
  },
  {
    shape: "Ellipse",
    name: "<Ellipse>",
    fn: makeEllipse,
  },
  {
    shape: "Triangle",
    name: "<Triangle>",
    fn: makeTriangle,
  },
];

export const MakeShapeSeeAlso: React.FC<{
  shape: string;
}> = ({ shape }) => {
  const shapeComponent = shapeComponents.find(
    (c) => c.shape.toLowerCase() === shape.toLowerCase()
  );

  return (
    <ul>
      <li>
        <a
          href={`/docs/shapes/${shapeComponent.shape.toLowerCase()}`}
        >{`<${shapeComponent.shape} />`}</a>
      </li>
      <li>
        <a href={`/docs/shapes`}>
          <code>@remotion/shapes</code>
        </a>
      </li>
      <li>
        <a
          href={`https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/make-${shape.toLowerCase()}.ts`}
        >
          Source code for this function
        </a>
      </li>
    </ul>
  );
};
