export type MaxResolution = {
  width: number | null;
  height: number | null;
  frameRate: number | null;
};

export const getMaxResolutionOfDevice = (
  device: MediaDeviceInfo,
): MaxResolution | null => {
  if (typeof InputDeviceInfo === "undefined") {
    return null;
  }

  if (!(device instanceof InputDeviceInfo)) {
    return null;
  }

  const capabilities = device.getCapabilities();

  const width = capabilities.width?.max ?? null;
  const height = capabilities.height?.max ?? null;
  const frameRate = capabilities.frameRate?.max ?? null;

  if (width === null && height === null) {
    return null;
  }

  return {
    width,
    height,
    frameRate,
  } as MaxResolution;
};
