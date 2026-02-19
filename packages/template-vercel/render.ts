// This file is copied into the Vercel sandbox and executed with `node --strip-types`
import {
  openBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { put } from "@vercel/blob";
import { readFileSync, statSync } from "fs";

export type RenderConfig = {
  serveUrl: string;
  compositionId: string;
  inputProps: Record<string, unknown>;
  blobToken: string;
  blobPath: string;
};

const config: RenderConfig = JSON.parse(process.argv[2]);

try {
  console.log(JSON.stringify({ type: "opening-browser" }));
  const browser = await openBrowser("chrome");
  console.log(JSON.stringify({ type: "selecting-composition" }));
  const composition = await selectComposition({
    serveUrl: config.serveUrl,
    id: config.compositionId,
    inputProps: config.inputProps,
    puppeteerInstance: browser,
  });

  await renderMedia({
    composition,
    serveUrl: config.serveUrl,
    codec: "h264",
    outputLocation: "/tmp/video.mp4",
    inputProps: config.inputProps,
    onProgress: ({ progress }) => {
      console.log(JSON.stringify({ type: "progress", progress }));
    },
    puppeteerInstance: browser,
  });

  console.log(JSON.stringify({ type: "uploading" }));
  const closePromise = browser.close({ silent: false });

  const videoBuffer = readFileSync("/tmp/video.mp4");
  const blob = await put(config.blobPath, videoBuffer, {
    access: "public",
    contentType: "video/mp4",
    token: config.blobToken,
  });

  console.log(
    JSON.stringify({
      type: "done",
      url: blob.downloadUrl,
      size: statSync("/tmp/video.mp4").size,
    }),
  );
  await closePromise;
} catch (err) {
  // This prints to stderr, not stdout
  console.error((err as Error).message);
  process.exit(1);
}
