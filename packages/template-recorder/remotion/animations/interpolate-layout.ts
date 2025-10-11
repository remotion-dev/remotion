import { interpolate } from "remotion";
import type { Layout } from "../layout/layout-types";

export const interpolateLayout = (
  firstLayout: Layout,
  secondLayout: Layout,
  progress: number,
) => {
  const left = interpolate(
    progress,
    [0, 1],
    [firstLayout.left, secondLayout.left],
  );
  const top = interpolate(
    progress,
    [0, 1],
    [firstLayout.top, secondLayout.top],
  );
  const width = interpolate(
    progress,
    [0, 1],
    [firstLayout.width, secondLayout.width],
  );
  const height = interpolate(
    progress,
    [0, 1],
    [firstLayout.height, secondLayout.height],
  );
  const borderRadius = interpolate(
    progress,
    [0, 1],
    [firstLayout.borderRadius, secondLayout.borderRadius],
  );
  const opacity = interpolate(
    progress,
    [0, 1],
    [firstLayout.opacity, secondLayout.opacity],
  );

  return {
    left,
    top,
    width,
    height,
    borderRadius,
    opacity,
  };
};

export const interpolateLayoutAndFade = (
  firstLayout: Layout,
  secondLayout: Layout,
  progress: number,
  shouldFade: boolean,
) => {
  const layout = interpolateLayout(firstLayout, secondLayout, progress);

  return {
    ...layout,
    opacity: shouldFade ? (progress > 0.5 ? 1 : 0) : 1,
  };
};
