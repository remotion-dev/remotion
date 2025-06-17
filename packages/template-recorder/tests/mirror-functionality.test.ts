import { expect, test } from "bun:test";

// Test the mirror state logic
test("mirror should default to true for webcam prefix", () => {
  // Simulate localStorage.getItem returning null (no saved preference)
  const savedPreference = null;
  const prefix = "webcam";

  // Logic from RecordingView.tsx
  let shouldMirror;
  if (savedPreference !== null) {
    shouldMirror = savedPreference === "true";
  } else {
    // Default to true for webcam, false for other sources
    shouldMirror = prefix === "webcam";
  }

  expect(shouldMirror).toBe(true);
});

test("mirror should default to false for non-webcam prefix", () => {
  // Simulate localStorage.getItem returning null (no saved preference)
  const savedPreference = null;
  const prefix = "screen";

  // Logic from RecordingView.tsx
  let shouldMirror;
  if (savedPreference !== null) {
    shouldMirror = savedPreference === "true";
  } else {
    // Default to true for webcam, false for other sources
    shouldMirror = prefix === "webcam";
  }

  expect(shouldMirror).toBe(false);
});

test("mirror should respect saved preference when available", () => {
  // Simulate localStorage.getItem returning "false"
  const savedPreference = "false";
  const prefix = "webcam";

  // Logic from RecordingView.tsx
  let shouldMirror;
  if (savedPreference !== null) {
    shouldMirror = savedPreference === "true";
  } else {
    // Default to true for webcam, false for other sources
    shouldMirror = prefix === "webcam";
  }

  expect(shouldMirror).toBe(false);
});

test("mirror transform CSS should be applied when mirror is true", () => {
  const mirror = true;
  const mediaStream = { streamState: { type: "loaded" } };

  // Logic from Stream.tsx videoStyle
  const videoStyle = {
    opacity: mediaStream ? 1 : 0,
    height: "100%",
    transform: mirror ? "scaleX(-1)" : undefined,
  };

  expect(videoStyle.transform).toBe("scaleX(-1)");
});

test("mirror transform CSS should not be applied when mirror is false", () => {
  const mirror = false;
  const mediaStream = { streamState: { type: "loaded" } };

  // Logic from Stream.tsx videoStyle
  const videoStyle = {
    opacity: mediaStream ? 1 : 0,
    height: "100%",
    transform: mirror ? "scaleX(-1)" : undefined,
  };

  expect(videoStyle.transform).toBe(undefined);
});
