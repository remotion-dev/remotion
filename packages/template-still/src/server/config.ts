/**
 * Select between 3 cache modes:
 * - "filesystem" will save rendered images in a temporary directory in the filesystem
 * - "s3-bucket" will cache images in a S3 bucket
 * - "none" will not use any caching and calculate all images on the fly.
 */
export const CACHE_MODE: CacheMode = "filesystem";

/**
 * If you selected "s3-bucket":
 * - Create an S3 bucket and specify it here alongside the S3 region
 * - Create an .env file with AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
 */
export const AWS_BUCKET_NAME = "remotion-image-cache";
export const AWS_REGION = "eu-central-1";

type CacheMode = "filesystem" | "s3-bucket" | "none";
