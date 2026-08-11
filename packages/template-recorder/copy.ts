import fs from "fs";
import { WEBCAM_PREFIX } from "./config/cameras";
import { convertVideos } from "./scripts/convert-video";
import { getDownloadsFolder } from "./scripts/get-downloads-folder";

const prefix = "empty";

const downloadsDir = getDownloadsFolder();
const filesFromDownloads = fs.readdirSync(downloadsDir);

const webcam = filesFromDownloads.filter((file) =>
  file.startsWith(WEBCAM_PREFIX),
);
const sorted = webcam.sort((a, b) => {
  const timestampA = Number(a.match(/([0-9]+)/)![1]);
  const timestampB = Number(b.match(/([0-9]+)/)![1]);

  return timestampB - timestampA;
});

if (sorted.length === 0) {
  console.error(
    "No recordings found in your downloads folder. Copy process aborted.",
  );
  process.exit();
}

const latest = sorted[0];
let latestTimestamp: number;
try {
  latestTimestamp = Number(latest.match(/([0-9]+)/)![1]);
} catch (err) {
  console.error("An error occured in the copying process: ", err);
  process.exit();
}

await convertVideos({
  latestTimestamp,
  compositionId: prefix,
  expectedFrames: null,
  onProgress: (progress) => {
    console.log(progress.filename, progress.framesEncoded, "frames");
  },
});
