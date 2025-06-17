import { UPLOAD_VIDEO } from "../../scripts/server/constants";
import { getExtension } from "./find-good-supported-codec";

export const parseJsonOrThrowSource = (data: Uint8Array, type: string) => {
  const asString = new TextDecoder("utf-8").decode(data);
  try {
    return JSON.parse(asString);
  } catch (err) {
    throw new Error(`Invalid JSON (${type}): ${asString}`);
  }
};

export const uploadFileToServer = async ({
  blob,
  endDate,
  prefix,
  selectedFolder,
  expectedFrames,
  mimeType,
}: {
  blob: Blob;
  endDate: number;
  prefix: string;
  selectedFolder: string;
  expectedFrames: number;
  mimeType: string;
}) => {
  const extension = getExtension(mimeType);
  const videoFile = new File([blob], `${prefix}${endDate}.${extension}`, {
    type: mimeType,
  });

  const url = new URL(UPLOAD_VIDEO, window.location.origin);

  url.search = new URLSearchParams({
    folder: selectedFolder,
    prefix,
    endDateAsString: endDate.toString(),
    expectedFrames: String(expectedFrames),
    extension,
  }).toString();

  const res = await fetch(url, {
    method: "POST",
    body: videoFile,
  });
  if (!res.body) {
    throw new Error("No body");
  }
  await res.text();
};
