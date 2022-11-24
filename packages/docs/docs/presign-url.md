---
id: presign-url
title: Upload with a presigned URL
---

In an app where users can upload videos and edit them, we want to make sure these videos get uploaded directly to our destination cloud storage. By generating a presigned URL on the server, you allow a user to directly upload a file into your cloud storage without having to through your server.

You can set constraints such as maximal file size and file type, apply rate limiting and require authentication, and predefine the key.

## What is a presign URL?

A presign URL is a URL to which you can send a file. This URL predefines the filename, filesize, contenttype and source location of the file it accepts.

## Why using presign URL?

The traditional way of handling a file upload would be to let the client upload the file on a server, which then handles the upload to the cloud storage. While this approach works, it's not ideal due to several reasons.

- If many clients happen to upload big files on the same server, this server can get slow or even break down under the load. With the presign workflow, the server only needs to create presign URLs, which reduces server load than handling file transfers.

- Since a lot of hosting solutions today are ephemeral or serverless, files should not be stored on them. There is no guarantee the files will still exist after a server restart and you might run out of disk space.

## Types and helper functions

In order to be able to check the file type and file size in the backend, both contentType and contentLength are sent in the PresignRequestBody.
With `makeS3Url()` a helperfunction is provided to set up the read URL

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
import { v4 } from "uuid";

export const generatePresignedUrl = async (
  contentType: string,
  contentLength: number,
  expiresIn: number
): Promise<string> => {
  if (contentLength > 1024 * 1024 * 200) {
    console.error(
      `File may not be over 200MB. Yours is ${contentLength} bytes.`
    );
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
    ContentLength: contentLength,
    ContentType: contentType,
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
  return presignedUrl;
};
```

After ensuring the provided file does not violate the constraint in place, the AWS client and SDK get derived with [getAwsClient()](/docs/lambda/getawsclient), which are needed to create and get the presign URL.

To create a unique ID which later will be contained in the presign URL, [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) V4 is used.

We can derive the URL at which the file will be available using makeS3Url().

The presignedUrl then gets created with the [getSignedUrl()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property).

## Useing the presigned URL

////////////////////////////////////////////////////////////////////

TO BE CONTINUED NEXT WEDNESDAY

////////////////////////////////////////////////////////////////////
