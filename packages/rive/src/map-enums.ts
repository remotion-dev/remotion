import type { AlignmentFactory } from "@rive-app/canvas-advanced";
import type { Alignment } from "@rive-app/canvas-advanced";
import { Fit } from "@rive-app/canvas-advanced";

export type RemotionRiveCanvasFit =
  | "contain"
  | "cover"
  | "fill"
  | "fit-height"
  | "none"
  | "scale-down"
  | "fit-width";

export const mapToFit = (fit: RemotionRiveCanvasFit): Fit => {
  if (fit === "contain") {
    return Fit.contain;
  }

  if (fit === "cover") {
    return Fit.cover;
  }

  if (fit === "fill") {
    return Fit.fill;
  }

  if (fit === "fit-height") {
    return Fit.fitHeight;
  }

  if (fit === "fit-width") {
    return Fit.fitWidth;
  }

  if (fit === "none") {
    return Fit.none;
  }

  if (fit === "scale-down") {
    return Fit.scaleDown;
  }

  throw new Error("Invalid fit: " + fit);
};

export type RemotionRiveCanvasAlignment =
  | "center"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "center-left"
  | "center-right"
  | "top-center"
  | "top-left"
  | "top-right";

export const mapToAlignment = (
  alignment: RemotionRiveCanvasAlignment,
  factory: AlignmentFactory
): Alignment => {
  if (alignment === "center") {
    return factory.center;
  }

  if (alignment === "bottom-center") {
    return factory.bottomCenter;
  }

  if (alignment === "bottom-left") {
    return factory.bottomLeft;
  }

  if (alignment === "bottom-right") {
    return factory.bottomRight;
  }

  if (alignment === "center-left") {
    return factory.centerLeft;
  }

  if (alignment === "center-right") {
    return factory.centerRight;
  }

  if (alignment === "top-center") {
    return factory.topCenter;
  }

  if (alignment === "top-left") {
    return factory.topLeft;
  }

  if (alignment === "top-right") {
    return factory.topRight;
  }

  throw new Error("Invalid alignment: " + alignment);
};
