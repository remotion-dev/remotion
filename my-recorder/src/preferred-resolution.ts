import { SizeConstraint } from "./helpers/get-selected-video-source";

export const setPreferredResolutionForDevice = (
  deviceId: string,
  videoSize: SizeConstraint | null,
) => {
  localStorage.setItem(
    `preferred-constraint-${deviceId}`,
    JSON.stringify(videoSize),
  );
};

// The Recorder only records at frame rates at least of 23.976 FPS.
// This is the lowest frame rate that is common, ignoring all frame rates lower than that.
export const DEFAULT_MINIMUM_FPS = 23.976;

export const getPreferredResolutionForDevice = (
  deviceId: string | null,
): SizeConstraint => {
  if (deviceId === null) {
    return {
      maxSize: null,
      minimumFps: null,
    };
  }

  const stored = localStorage.getItem(`preferred-constraint-${deviceId}`);
  if (stored === null || stored === "null") {
    return {
      maxSize: null,
      minimumFps: null,
    };
  }

  return JSON.parse(stored) as SizeConstraint;
};
