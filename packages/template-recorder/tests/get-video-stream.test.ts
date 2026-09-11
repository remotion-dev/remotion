import { expect, test } from "bun:test";
import { getCameraStreamConstraints } from "../src/helpers/get-video-stream";

test("requires the selected camera instead of accepting the browser default", () => {
  expect(
    getCameraStreamConstraints(
      {
        type: "camera",
        deviceId: "camo-camera-id",
        maxWidth: 1920,
        maxHeight: 1080,
        minFps: 30,
      },
      false,
    ),
  ).toMatchObject({
    deviceId: { exact: "camo-camera-id" },
  });
});
