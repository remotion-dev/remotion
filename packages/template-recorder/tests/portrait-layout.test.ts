import { expect, test } from "bun:test";
import {
  DIMENSIONS,
  PORTRAIT_BOTTOM_SAFE_SPACE,
  PORTRAIT_CAPTION_SIDE_SAFE_SPACE,
} from "../config/layout";
import type { SceneVideos, WebcamPosition } from "../config/scenes";
import type { VideoSceneAndMetadata } from "../config/scenes";
import { getSubtitleTransform } from "../remotion/animations/caption-transitions/subtitle-transitions";
import type { Layout } from "../remotion/layout/layout-types";
import { getVideoSceneLayout } from "../remotion/layout/get-layout";

const landscapeRecordings: SceneVideos = {
  webcam: { width: 1920, height: 1080 },
  display: { width: 1660, height: 934 },
};

const layoutFor = (
  videos: SceneVideos,
  webcamPosition: WebcamPosition = "bottom-right",
) =>
  getVideoSceneLayout({
    canvasLayout: "portrait",
    videos,
    webcamPosition,
  });

test("portrait layout uses a 1080 by 1920 canvas", () => {
  expect(DIMENSIONS.portrait).toEqual({ width: 1080, height: 1920 });
});

test("portrait layout stacks the display above a bottom-positioned webcam", () => {
  const layout = layoutFor(landscapeRecordings, "bottom-right");

  expect(layout.displayLayout).not.toBeNull();
  expect(layout.displayLayout?.top).toBe(30);
  expect(layout.webcamLayout.top).toBeGreaterThan(
    (layout.displayLayout?.top ?? 0) + (layout.displayLayout?.height ?? 0),
  );
  expect(layout.webcamLayout.left).toBe(30);
  expect(layout.webcamLayout.width).toBe(1020);
  expect(layout.subtitleLayout).not.toBeNull();
  expect(layout.webcamLayout.top + layout.webcamLayout.height).toBeLessThan(
    layout.subtitleLayout?.top ?? 0,
  );
  expect(
    (layout.subtitleLayout?.top ?? 0) + (layout.subtitleLayout?.height ?? 0),
  ).toBeLessThanOrEqual(
    DIMENSIONS.portrait.height - PORTRAIT_BOTTOM_SAFE_SPACE,
  );
  expect(layout.subtitleLayout).toMatchObject({
    left: PORTRAIT_CAPTION_SIDE_SAFE_SPACE,
    width: DIMENSIONS.portrait.width - PORTRAIT_CAPTION_SIDE_SAFE_SPACE * 2,
  });
});

test("portrait layout stacks a top-positioned webcam above the display", () => {
  const layout = layoutFor(landscapeRecordings, "top-left");

  expect(layout.webcamLayout.top).toBe(30);
  expect(layout.displayLayout?.top).toBeGreaterThan(
    layout.webcamLayout.top + layout.webcamLayout.height,
  );
});

test("portrait camera-only scenes fill the canvas and retain a caption lane", () => {
  const layout = layoutFor({
    webcam: { width: 1920, height: 1080 },
    display: null,
  });

  expect(layout.webcamLayout).toMatchObject({
    left: 0,
    top: 0,
    width: 1080,
    height: 1920,
  });
  expect(layout.displayLayout).toBeNull();
  expect(layout.subtitleLayout?.top).toBeGreaterThan(1200);
  expect(
    (layout.subtitleLayout?.top ?? 0) + (layout.subtitleLayout?.height ?? 0),
  ).toBeLessThanOrEqual(
    DIMENSIONS.portrait.height - PORTRAIT_BOTTOM_SAFE_SPACE,
  );
});

test("portrait captions remain in the safe lane across centered camera scenes", () => {
  const subtitleLayout: Layout = {
    left: 30,
    top: 1630,
    width: 1020,
    height: 260,
    borderRadius: 20,
    opacity: 1,
  };
  const centeredScene = {
    type: "video-scene",
    layout: {
      webcamLayout: { ...subtitleLayout, top: 0, height: 1920 },
      displayLayout: null,
      subtitleLayout,
    },
    webcamPosition: "center",
  } as VideoSceneAndMetadata;

  expect(
    getSubtitleTransform({
      enterProgress: 0.5,
      exitProgress: 0,
      canvasWidth: 1080,
      canvasHeight: 1920,
      nextScene: centeredScene,
      previousScene: centeredScene,
      scene: centeredScene,
      subtitleLayout,
    }),
  ).toEqual(subtitleLayout);
});
