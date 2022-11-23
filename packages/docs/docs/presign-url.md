---
id: presign-url
title: Upload with presign URL
---

When uploading a file which will be used in a remotion component, we want to make sure we can upload this file immediately on our destination server.

- how to upload on s3 with presign workflow (so we dont need to upload on own server first)
- explaining benefits -> you can set clear constraint (how many uploads are possible, how big can the files be, what type of files are allowed, is the user logged in etc...)

### presign.ts

```tsx twoslash
// ---cut---
import { AwsRegion } from "@remotion/lambda";

export type PresignResponse = {
  uploadUrl: string;
  readUrl: string;
  id: string;
  bucketName: string;
  region: AwsRegion;
};

export type PresignRequestBody = {
  contentLength: number;
  contentType: string;
};

export const makeS3Url = ({
  bucketName,
  fileId,
  region,
}: {
  fileId: string;
  region: AwsRegion;
  bucketName: string;
}) => {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${fileId}`;
};
```

### presign endpoint

```tsx
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AwsRegion, getAwsClient, getOrCreateBucket } from "@remotion/lambda";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 } from "uuid";
import { PresignRequestBody, PresignResponse } from "./presign";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = req.body as PresignRequestBody;

  if (body.contentType !== "application/octet-stream") {
    return res.status(400).json({
      message: `Content type ${body.contentType} is not supported`,
    });
  }

  const contentLength = Number(body.contentLength ?? 0);

  //example constraint we can set while creating the presign url
  if (contentLength > 1024 * 1024 * 200) {
    return res.status(400).json({
      message: `File may not be over 200MB. Yours is ${contentLength} bytes.`,
    });
  }

  const { client, sdk } = getAwsClient({
    region: process.env.REMOTION_AWS_REGION as AwsRegion,
    service: "s3",
  });

  //using uuid to generate a random primary key
  const id = v4();

  const region = process.env.REMOTION_AWS_REGION as AwsRegion;
  const { bucketName } = await getOrCreateBucket({
    region,
  });

  //command from AWS S3
  const command = new sdk.PutObjectCommand({
    Bucket: bucketName,
    Key: id,
    ACL: "public-read",
    ContentLength: body.contentLength,
    ContentType: body.contentType,
  });

  //url which will be used to stream the file in remotion (?)
  const readUrl = makeS3Url({
    videoId: id,
    bucketName,
    region,
  });

  //getSignedUrl is an API from AWS --> link it in text
  //expiresIn can be set to your liking
  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn: 60 * 5,
  });

  const response: PresignResponse = {
    uploadUrl: presignedUrl,
    readUrl,
    id,
    bucketName,
    region,
  };

  return res.status(200).json(response);
}
```
