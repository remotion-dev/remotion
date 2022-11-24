---
id: presign-url
title: Upload with presign URL
---

In an app where users can upload videos and edit them, we want to make sure these videos get uploaded directly on our destination cloud storage (other word for destination cloud storage?). With the following presign URL workflow, a unique temporary upload url is provided with the possibility to ensure that individually set constraints (such as maximal file size, filetype,...) aren't violated. (reformulate this sentence)

## What is a presign URL?

A presign URL is a URL to which you can send a file. This URL predefines the filename, filesize, contenttype and source location of the file it accepts.

## Why using presign URL?

The traditional way of handling a file upload would be to let the client upload the file on the server, which then handles the upload to the cloud storage. While this approach works, its not ideal due to several reasons.

- If many clients happen to upload big files on the server, the server can get slow or even break down under the load. With the presign workflow, the server only needs to create presign URLs, which creats way less server load than handling file transfers.

- Since a lot of servers today are based on ephemeral environments, files should not be stored on them. There is no guarantee the files will still exist after a server restart.

## Types and helper functions

In order to be able to check the file type and file size in the backend, both contentType and contentLength are sent in the PresignRequestBody.
With `makeS3Url()` a helperfunction is provided to set up the read URL (??)

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

## Generating the presign url

By making a POST request to the following endpoint, the creation of a presign URL gets triggered. (Example was done with a Next Endpoint)

```tsx twoslash
const makeS3Url = ({
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
// ---cut---

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AwsRegion, getAwsClient, getOrCreateBucket } from "@remotion/lambda";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = req.body as PresignRequestBody;

  //content type precondition
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

  //generates a random ID
  const id = v4();

  const region = process.env.REMOTION_AWS_REGION as AwsRegion;
  const { bucketName } = await getOrCreateBucket({
    region,
  });

  //passing conentLength and contentType results in the URL only
  //accepting a file with this exact size and type
  const command = new sdk.PutObjectCommand({
    Bucket: bucketName,
    Key: id,
    ACL: "public-read",
    ContentLength: body.contentLength,
    ContentType: body.contentType,
  });

  //url which will be used to read the uploaded file
  const readUrl = makeS3Url({
    fileId: id,
    bucketName,
    region,
  });

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

After ensuring the provided file does not violate the constraint in place, the AWS client and SDK get derived with [getAwsClient()](/docs/lambda/getawsclient), which are needed to create and get the presign URL.

To create a unique ID which later will be contained in the presign URL, [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) V4 is used.

After deriving the AWS Region and the S3 bucket name, command object is created, which is needed to get the signed URL.

By using the helper function `makeS3Url()`, the read url will be created.

The presignedUrl then gets created with the [getSingedUrl()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property).
