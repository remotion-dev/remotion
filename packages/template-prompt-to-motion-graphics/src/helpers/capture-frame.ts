import { renderStillOnWeb } from "@remotion/web-renderer";
import type { ComponentType } from "react";

interface CaptureConfig {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

/**
 * Captures a frame from a Remotion composition and returns it as a base64 data URL.
 */
export async function captureFrame(
  Component: ComponentType,
  frame: number,
  config: CaptureConfig,
): Promise<string> {
  const { blob } = await renderStillOnWeb({
    composition: {
      component: Component,
      id: "frame-capture",
      width: config.width,
      height: config.height,
      fps: config.fps,
      durationInFrames: config.durationInFrames,
    },
    frame,
    imageFormat: "jpeg",
    scale: 0.5, // 960x540 - good enough for AI context
    inputProps: {},
  });

  // Convert blob to base64 data URL
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Converts a File to a base64 data URL.
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
