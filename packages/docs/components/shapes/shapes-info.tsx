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
    params: [
      {
        name: "width",
        type: "number",
        description: "The width of the rectangle.",
      },
      {
        name: "height",
        type: "number",
        description: "The height of the rectangle.",
      },
    ],
  },
  {
    shape: "Circle",
    name: "<Circle>",
    fn: makeCircle,
    params: [
      {
        name: "radius",
        type: "number",
        description: "The radius of the circle.",
      },
    ],
  },
  {
    shape: "Ellipse",
    name: "<Ellipse>",
    fn: makeEllipse,
    params: [
      {
        name: "rx",
        type: "number",
        description: "The radius of the ellipse on the X axis.",
      },
      {
        name: "ry",
        type: "number",
        description: "The radius of the ellipse on the Y axis.",
      },
    ],
  },
  {
    shape: "Triangle",
    name: "<Triangle>",
    fn: makeTriangle,
    params: [
      {
        name: "length",
        type: "number",
        description: "The length of one triangle side.",
      },
      {
        name: "direction",
        type: '"left" | "right" | "up" | "down"',
        description: "The direction of the triangle.",
      },
    ],
  },
];

export const ShapeOptions: React.FC<{
  shape: string;
}> = ({ shape }) => {
  const shapeComponent = shapeComponents.find(
    (c) => c.shape.toLowerCase() === shape.toLowerCase()
  );

  return (
    <React.Fragment>
      {shapeComponent.params.map((p) => {
        return (
          <React.Fragment key={p.name}>
            <h3>
              <code>{p.name}</code>
            </h3>
            <p>
              <em>{p.type}</em>
            </p>
            <p>{p.description}</p>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

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
