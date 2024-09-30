import { Shape } from "three";

export function roundedRect({
  width,
  height,
  radius,
}: {
  width: number;
  height: number;
  radius: number;
}): Shape {
  const roundedRectShape = new Shape();
  roundedRectShape.moveTo(0, radius);
  roundedRectShape.lineTo(0, height - radius);
  roundedRectShape.quadraticCurveTo(0, height, radius, height);
  roundedRectShape.lineTo(width - radius, height);
  roundedRectShape.quadraticCurveTo(width, height, width, height - radius);
  roundedRectShape.lineTo(width, radius);
  roundedRectShape.quadraticCurveTo(width, 0, width - radius, 0);
  roundedRectShape.lineTo(radius, 0);
  roundedRectShape.quadraticCurveTo(0, 0, 0, radius);
  return roundedRectShape;
}
