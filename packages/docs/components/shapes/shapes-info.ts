import {
  makeCircle,
  makeEllipse,
  makeRect,
  makeTriangle,
} from "@remotion/shapes";

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
