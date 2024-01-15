/* eslint-disable max-params */

import type {
  TransformFunction,
  LengthUnit,
  LengthPercentageUnit,
  AngleUnit,
} from "../../type";

/* Matrix transformation */

function matrix(
  a: number,
  b: number,
  c: number,
  d: number,
  tx: number,
  ty: number
): TransformFunction {
  return () => `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
}

function matrix3d(
  a1: number,
  b1: number,
  c1: number,
  d1: number,
  a2: number,
  b2: number,
  c2: number,
  d2: number,
  a3: number,
  b3: number,
  c3: number,
  d3: number,
  a4: number,
  b4: number,
  c4: number,
  d4: number
): TransformFunction {
  return () =>
    `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
}

/* Perspective */

function perspective(
  length: number,
  unit: LengthUnit = "px"
): TransformFunction {
  return () => `perspective(${length}${unit})`;
}

/* Rotation */

function rotate(angle: number, unit: AngleUnit = "deg"): TransformFunction {
  return () => `rotate(${angle}${unit})`;
}

function rotate3d(
  x: number,
  y: number,
  z: number,
  angle: number,
  unit: AngleUnit = "deg"
): TransformFunction {
  return () => `rotate3d(${x}, ${y}, ${z}, ${angle}${unit})`;
}

function rotateX(angle: number, unit: AngleUnit = "deg"): TransformFunction {
  return () => `rotateX(${angle}${unit})`;
}

function rotateY(angle: number, unit: AngleUnit = "deg"): TransformFunction {
  return () => `rotateY(${angle}${unit})`;
}

function rotateZ(angle: number, unit: AngleUnit = "deg"): TransformFunction {
  return () => `rotateZ(${angle}${unit})`;
}

/* Scale */

function scale(x: number, y: number = x): TransformFunction {
  return () => `scale(${x}, ${y})`;
}

function scale3d(x: number, y: number, z: number): TransformFunction {
  return () => `scale3d(${x}, ${y}, ${z})`;
}

function scaleX(x: number): TransformFunction {
  return () => `scaleX(${x})`;
}

function scaleY(y: number): TransformFunction {
  return () => `scaleY(${y})`;
}

function scaleZ(z: number): TransformFunction {
  return () => `scaleZ(${z})`;
}

/* Skew */

function skew(
  x: number,
  y: number = x,
  unit: AngleUnit = "deg"
): TransformFunction {
  return () => `skew(${x}${unit}, ${y}${unit})`;
}

function skewX(angle: number, unit: AngleUnit = "deg"): TransformFunction {
  return () => `skewX(${angle}${unit})`;
}

function skewY(angle: number, unit: AngleUnit = "deg"): TransformFunction {
  return () => `skewY(${angle}${unit})`;
}

/* Translation */

function translate(
  x: number,
  y = 0,
  unitX: LengthPercentageUnit = "px",
  unitY: LengthPercentageUnit = unitX
): TransformFunction {
  return () => `translate(${x}${unitX}, ${y}${unitY})`;
}

function translate3d(
  x: number,
  y: number,
  z: number,
  unitX: LengthPercentageUnit = "px",
  unitY: LengthPercentageUnit = unitX,
  unitZ: LengthUnit = "px"
): TransformFunction {
  return () => `translate3d(${x}${unitX}, ${y}${unitY}, ${z}${unitZ})`;
}

function translateX(
  x: number,
  unit: LengthPercentageUnit = "px"
): TransformFunction {
  return () => `translateX(${x}${unit})`;
}

function translateY(
  y: number,
  unit: LengthPercentageUnit = "px"
): TransformFunction {
  return () => `translateY(${y}${unit})`;
}

function translateZ(z: number, unit: LengthUnit = "px"): TransformFunction {
  return () => `translateZ(${z}${unit})`;
}

export {
  matrix,
  matrix3d,
  perspective,
  rotate,
  rotate3d,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  scale3d,
  scaleX,
  scaleY,
  scaleZ,
  skew,
  skewX,
  skewY,
  translate,
  translate3d,
  translateX,
  translateY,
  translateZ,
};
