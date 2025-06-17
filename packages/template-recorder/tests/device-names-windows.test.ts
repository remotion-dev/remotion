import { expect, test } from "bun:test";
import { formatDeviceLabel } from "../src/helpers/format-device-label";

const logiStreamCamDefault =
  "Default - Microphone (Logitech StreamCam) (046d:0893)";

const logiStreamCamCommunicationMic =
  "Communications - Microphone (Logitech StreamCam) (046d:0893)";

const hdmiMicrophone = "HDMI (2- Cam Link 4K) (0fd9:007b)";

const elgatoSoundCapture = "Line (Elgato Sound Capture)";

const gameCaptureMicrophone =
  "Game Capture HD60 X (Game Capture HD60 X) (0fd9:0082)";

const rodeNtUsbMicrophone = "Microphone (6- RODE NT-USB) (19f7:0003)";

const logitechStreamCamMicrophone =
  "Microphone (Logitech StreamCam) (046d:0893)";

const logitechStreamCamVideo = "Logitech StreamCam (046d:0893)";

const gameCaptureHD60XVideo = "Game Capture HD60 X (0fd9:0082)";

const camLink4KVideo = "Cam Link 4K (0fd9:007b)";

const logiCaptureVideo = "Logi Capture";

const lumixWebcamVideo = "LUMIX Webcam Software";

const obsVirtualCameraVideo = "OBS Virtual Camera";

const elgatoScreenLinkVideo = "Elgato Screen Link";

const p27q20Default =
  "Default - 4 - P27q-20 (AMD High Definition Audio Device)";

const communicationsSpeakers =
  "Communications - Speakers (6- RODE NT-USB) (19f7:0003)";

const realtekDigitalOutput = "Realtek Digital Output (Realtek(R) Audio)";

const speakersRodeNtUsb = "Speakers (6- RODE NT-USB) (19f7:0003)";

test("Test for logiStreamCamDefault", () => {
  expect(formatDeviceLabel(logiStreamCamDefault)).toEqual("Logitech StreamCam");
});

test("Test for logiStreamCamCommunicationMic", () => {
  expect(formatDeviceLabel(logiStreamCamCommunicationMic)).toEqual(
    "Logitech StreamCam",
  );
});

test("Test for HDMI Microphone", () => {
  expect(formatDeviceLabel(hdmiMicrophone)).toEqual("Cam Link 4K");
});

test("Test for Line Microphone", () => {
  expect(formatDeviceLabel(elgatoSoundCapture)).toEqual("Elgato Sound Capture");
});

test("Test for Game Capture HD60 X Microphone", () => {
  expect(formatDeviceLabel(gameCaptureMicrophone)).toEqual(
    "Game Capture HD60 X",
  );
});

test("Test for RODE NT-USB Microphone", () => {
  expect(formatDeviceLabel(rodeNtUsbMicrophone)).toEqual("RODE NT-USB");
});

test("Test for Logitech StreamCam Microphone", () => {
  expect(formatDeviceLabel(logitechStreamCamMicrophone)).toEqual(
    "Logitech StreamCam",
  );
});

test("Test for Logitech StreamCam Video", () => {
  expect(formatDeviceLabel(logitechStreamCamVideo)).toEqual(
    "Logitech StreamCam",
  );
});

test("Test for Game Capture HD60 X Video", () => {
  expect(formatDeviceLabel(gameCaptureHD60XVideo)).toEqual(
    "Game Capture HD60 X",
  );
});

test("Test for Cam Link 4K Video", () => {
  expect(formatDeviceLabel(camLink4KVideo)).toEqual("Cam Link 4K");
});

test("Test for Logi Capture Video", () => {
  expect(formatDeviceLabel(logiCaptureVideo)).toEqual("Logi Capture");
});

test("Test for LUMIX Webcam Video", () => {
  expect(formatDeviceLabel(lumixWebcamVideo)).toEqual("LUMIX Webcam Software");
});

test("Test for OBS Virtual Camera Video", () => {
  expect(formatDeviceLabel(obsVirtualCameraVideo)).toEqual(
    "OBS Virtual Camera",
  );
});

test("Test for Elgato Screen Link Video", () => {
  expect(formatDeviceLabel(elgatoScreenLinkVideo)).toEqual(
    "Elgato Screen Link",
  );
});

test("Test for Default Audio Output", () => {
  expect(formatDeviceLabel(p27q20Default)).toEqual(
    "AMD High Definition Audio Device",
  );
});

test("Test for Communications Speakers", () => {
  expect(formatDeviceLabel(communicationsSpeakers)).toEqual("RODE NT-USB");
});

test("Test for Realtek Digital Output", () => {
  expect(formatDeviceLabel(realtekDigitalOutput)).toEqual("Realtek(R) Audio");
});

test("Test for Speakers RODE NT-USB", () => {
  expect(formatDeviceLabel(speakersRodeNtUsb)).toEqual("RODE NT-USB");
});
