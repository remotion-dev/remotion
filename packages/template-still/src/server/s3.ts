import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { AWS_BUCKET_NAME, AWS_REGION } from "./config";

const client = new S3Client({
  region: AWS_REGION,
});

export const existsOnS3 = async (key: string) => {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
};

export const getOnS3 = async (key: string): Promise<Readable> => {
  const obj = await client.send(
    new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    }),
  );
  return obj.Body as Readable;
};

export const writeToS3 = async (key: string, read: Buffer) => {
  await client.send(
    new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: read,
    }),
  );
};
