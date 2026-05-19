import { Label, formatDeviceLabel } from "../helpers/format-device-label";

const getDeviceLabel = (device: MediaDeviceInfo): string => {
  const labels: Label[] = JSON.parse(localStorage.getItem("labels") ?? "[]");

