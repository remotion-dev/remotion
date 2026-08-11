import { expect, test } from "bun:test";
import { formatDeviceLabel } from "../src/helpers/format-device-label";

test("remove usb identifier ", () => {
  expect(formatDeviceLabel("FaceTime HD Camera (1C1C:B782)")).toEqual(
    "FaceTime HD Camera",
  );
});

test("remove Speaker tag ", () => {
  expect(formatDeviceLabel("6- RODE NT-USB (19f7:0003)")).toEqual(
    "RODE NT-USB",
  );
});

test("remove (Built-in) ", () => {
  expect(
    formatDeviceLabel("Default - MacBook Pro Microphone (Built-in)"),
  ).toEqual("Default - MacBook Pro Microphone");
});

test("remove (Virtual) ", () => {
  expect(formatDeviceLabel("Microsoft Teams Audio Device (Virtual)")).toEqual(
    "Microsoft Teams Audio Device",
  );
});

test("Simple label should stay unaffected ", () => {
  expect(formatDeviceLabel("LUMIX Webcam Software")).toEqual(
    "LUMIX Webcam Software",
  );
});

test("Linkbuds S test ", () => {
  expect(formatDeviceLabel("LinkBuds S (Bluetooth)")).toEqual("LinkBuds S");
});

test("OBS Virtual Camera test", () => {
  expect(formatDeviceLabel("OBS Virtual Camera (m-de:vice)")).toEqual(
    "OBS Virtual Camera",
  );
});
