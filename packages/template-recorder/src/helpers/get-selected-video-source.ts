import { Dimensions } from "../../config/layout";
import { DEFAULT_MINIMUM_FPS } from "../preferred-resolution";
import { MaxResolution } from "./get-max-resolution-of-device";

export type SelectedSource =
  | {
      type: "camera";
      deviceId: string;
      maxWidth: number | null;
      maxHeight: number | null;
      minFps: number | null;
    }
  | {
      type: "display-without-audio";
    }
  | {
      type: "display-with-audio";
    };

export type VideoSize = "4K" | "1080p" | "720p" | "480p";

export type SizeConstraint = {
  maxSize: VideoSize | null;
  minimumFps: number | null;
};

export const FPS_AVAILABLE = [240, 120, 60, 30];

export const VIDEO_SIZES: { [key in VideoSize]: Dimensions } = {
  "4K": { width: 3840, height: 2160 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
  "480p": { width: 640, height: 480 },
};

export const getSelectedVideoSource = ({
  resolutionConstraint,
  maxResolution,
  device,
}: {
  resolutionConstraint: SizeConstraint;
  maxResolution: MaxResolution | null;
  device: MediaDeviceInfo;
}): SelectedSource | null => {
  const constrainedWidth =
    resolutionConstraint.maxSize === null
      ? null
      : VIDEO_SIZES[resolutionConstraint.maxSize].width;
  const constrainedHeight =
    resolutionConstraint.maxSize === null
      ? null
      : VIDEO_SIZES[resolutionConstraint.maxSize].height;

  if (maxResolution === null) {
    return {
      type: "camera",
      deviceId: device.deviceId,
      maxWidth: constrainedWidth,
      maxHeight: constrainedHeight,
      minFps: null,
    };
  }

  const maxWidth =
    constrainedWidth === null
      ? maxResolution.width
      : Math.min(constrainedWidth, maxResolution.width ?? Infinity);
  const maxHeight =
    constrainedHeight === null
      ? maxResolution.height
      : Math.min(constrainedHeight, maxResolution.height ?? Infinity);
  const minFps = Math.min(
    maxResolution.frameRate ?? Infinity,
    resolutionConstraint.minimumFps ?? DEFAULT_MINIMUM_FPS,
  );

  return {
    type: "camera",
    deviceId: device.deviceId,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    minFps: minFps,
  };
};
