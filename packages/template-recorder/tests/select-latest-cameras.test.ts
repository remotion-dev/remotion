import { expect, mock, test } from "bun:test";

mock.module("remotion", () => ({
  getStaticFiles: () => [],
}));

const { selectLatestCamerasForScenes } = await import(
  "../remotion/calculate-metadata/get-camera"
);

test("uses the newest take when one scene has multiple recordings", () => {
  expect(selectLatestCamerasForScenes([1, 2], 1)).toEqual([2]);
});

test("keeps the latest takes in chronological order for multiple scenes", () => {
  expect(selectLatestCamerasForScenes([1, 2, 3], 2)).toEqual([2, 3]);
});

test("does not select takes without a video scene", () => {
  expect(selectLatestCamerasForScenes([1, 2], 0)).toEqual([]);
});
