import fs, { createReadStream } from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { CACHE_MODE } from "./config";
import { existsOnS3, getOnS3, writeToS3 } from "./s3";

const cacheDir = fs.promises.mkdtemp(path.join(os.tmpdir(), "remotion-"));

/**
 * There are three ways of caching.
 - `"filesystem"`, the default, will cache generated images locally. This is a good way of caching if you host the server on a non-ephemereal platform and have enough storage.
	- `"none"` will disable all caching and calculate all images on the fly.
	- `"s3-bucket"` will cache images in a S3 bucket. If you choose this option, you need to provide `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables containing AWS credentials which have permission of reading and writing to S3 as well as configure a bucket name and region in `src/server/config.ts`. See README on how to configure it.
 */

const getFileFromHash = async (imageHash: string) => {
  return path.join(await cacheDir, imageHash);
};

export const isInCache = async (imageHash: string): Promise<boolean> => {
  if (CACHE_MODE === "none") {
    return false;
  }
  if (CACHE_MODE === "s3-bucket") {
    return existsOnS3(imageHash);
  }

  return fs.existsSync(await getFileFromHash(imageHash));
};

export const getFromCache = async (imageHash: string): Promise<Readable> => {
  if (CACHE_MODE === "none") {
    throw new TypeError("No cache enabled");
  }

  if (CACHE_MODE === "s3-bucket") {
    return getOnS3(imageHash);
  }

  return createReadStream(await getFileFromHash(imageHash));
};

export const saveToCache = async (imageHash: string, file: Buffer) => {
  if (CACHE_MODE === "none") {
    return;
  }

  if (CACHE_MODE === "s3-bucket") {
    return writeToS3(imageHash, file);
  }

  return fs.promises.writeFile(await getFileFromHash(imageHash), file);
};
