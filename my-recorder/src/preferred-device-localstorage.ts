import { Prefix } from "./helpers/prefixes";

const getPreferredDeviceForPrefix = (
  prefix: Prefix,
  type: "video" | "audio",
) => {
  return window.localStorage.getItem(
    `recorder.preferredDevice.${type}.${prefix}`,
  );
};

export const setPreferredDeviceForPrefix = (
  prefix: Prefix,
  type: "video" | "audio",
  deviceId: string | null,
) => {
  window.localStorage.setItem(
    `recorder.preferredDevice.${type}.${prefix}`,
    String(deviceId),
  );
};

export const getPreferredDeviceIfExists = (
  prefix: Prefix,
  type: "video" | "audio",
  devices: MediaDeviceInfo[],
) => {
  const deviceId = getPreferredDeviceForPrefix(prefix, type);
  if (deviceId === "" || deviceId === null) {
    return null;
  }

  const device = devices.find((d) => d.deviceId === deviceId);

  if (device === undefined) {
    return null;
  }

  return device.deviceId;
};
