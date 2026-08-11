import { enumerateDevicesOrTimeOut } from "./enumerate-devices-or-time-out";
import { Label, formatDeviceLabel } from "./format-device-label";

export const storeLabelsToLS = (devices: MediaDeviceInfo[]) => {
  const labels: Label[] = JSON.parse(localStorage.getItem("labels") ?? "[]");
  devices.forEach((device) => {
    const id = device.deviceId;
    const cleanLabel = formatDeviceLabel(device.label);

    if (!labels.some((l) => l.id === id) && cleanLabel !== "") {
      labels.push({ id, label: cleanLabel });
    }
  });

  localStorage.setItem("labels", JSON.stringify(labels));
};

export const hasNewDevices = (devices: MediaDeviceInfo[]): boolean => {
  const labels: Label[] = JSON.parse(localStorage.getItem("labels") || "[]");

  const hasNew = !devices.every((device) => {
    return labels.some((l) => l.id === device.deviceId);
  });

  return hasNew;
};

export const getDevices = async () => {
  const fetchedDevices = await enumerateDevicesOrTimeOut();

  const hasEmptyLabels = fetchedDevices.some((device) => device.label === "");
  const hasNew = hasNewDevices(fetchedDevices);
  if (hasNew && hasEmptyLabels) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const _devices = await navigator.mediaDevices.enumerateDevices();
    storeLabelsToLS(_devices);
    stream.getAudioTracks().forEach((track) => track.stop());
    stream.getVideoTracks().forEach((track) => track.stop());

    return _devices;
  }

  if (hasNew) {
    storeLabelsToLS(fetchedDevices);
  }

  return fetchedDevices;
};
