---
image: /generated/articles-docs-presigned-urls.png
id: presigned-urls
title: Upload with a presigned URL
crumb: "Building video apps"
---

This article provides guidance for webapps wanting to allow users to upload videos and other assets. We recommend to generate a presigned URL server-side that allows a user to directly upload a file into your cloud storage without having to pass the file through your server.

You can set constraints such as maximal file size and file type, apply rate limiting, require authentication, and predefine the storage location.

## Why use presigned URL?

The traditional way of implementing a file upload would be to let the client upload the file onto a server, which then stores the file on disk or forwards the upload to cloud storage. While this approach works, it's not ideal due to several reasons.

- **Reduce load**: If many clients happen to upload big files on the same server, this server can get slow or even break down under the load. With the presign workflow, the server only needs to create presign URLs, which reduces server load than handling file transfers.
- **Reduce spam**: To prevent your users using your upload feature as free hosting space, you can deny them a presigned URL if they step over your allowance.
- **Data safety**: Since a lot of hosting solutions today are ephemeral or serverless, files should not be stored on them. There is no guarantee the files will still exist after a server restart and you might run out of disk space.

## AWS Example

This example assumes user uploads are stored in S3. For other frontends

First, accept a file in your frontend, for example using `<input type="file">`. You should get a `File`, from which you can determine the content type and content length:

```ts twoslash title="App.tsx"
// @module: ESNext
// @target: ESNext
import { interpolate } from "remotion";
const file: File = {} as unknown as File;
// ---cut---
const contentType = file.type || "application/octet-stream";
const arrayBuffer = await file.arrayBuffer();
const contentLength = arrayBuffer.byteLength;
```

This example uses [`@aws-sdk/s3-request-presigner`](https://github.com/aws/aws-sdk-js-v3/tree/main/packages/s3-request-presigner) and [the AWS SDK imported from `@remotion/lambda`](/docs/lambda/getawsclient). By calling the function below, two URLs are generated:

- `presignedUrl` is a URL to which the file can be uploaded to
- `readUrl` is the URL from which the file can be read from.

```tsx twoslash title="api/generate-presigned-url.ts"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AwsRegion, getAwsClient } from "@remotion/lambda";
import { v4 } from "uuid";

export const generatePresignedUrl = async (
  contentType: string,
  contentLength: number,
  expiresIn: number,
  bucketName: string,
  region: AwsRegion
): Promise<{ presignedUrl: string; readUrl: string }> => {
  if (contentLength > 1024 * 1024 * 200) {
    throw new Error(
      `File may not be over 200MB. Yours is ${contentLength} bytes.`
    );
  }

  const { client, sdk } = getAwsClient({
    region: process.env.REMOTION_AWS_REGION as AwsRegion,
    service: "s3",
  });

  const key = v4();

  const command = new sdk.PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ACL: "public-read",
    ContentLength: contentLength,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn,
  });

  // The location of the assset after the upload
  const readUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { presignedUrl, readUrl };
};
```

Explanation:

- First, the upload request gets checked for constraints. In this example, we reject uploads that are over 200MB. You could add more constraints or add rate-limiting.
- The AWS SDK gets imported using [getAwsClient()](/docs/lambda/getawsclient). If you don't use Remotion Lambda, install the [`@aws-sdk/client-s3`](https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3) package directly.
- A [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) gets used as the filename to avoid name clashes.
- Finally, the presigned URL and output URL get calculated and returned.

## Using the presigned URL

Send the presigned URL back to the client. Afterwards, you can now perform an upload using the built-in [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) function:

```ts twoslash title="App.tsx"
// @module: ESNext
// @target: ESNext
import { interpolate } from "remotion";
const presignedUrl = "hi";
const file: File = {} as unknown as File;

const contentType = file.type || "application/octet-stream";
const arrayBuffer = await file.arrayBuffer();
// ---cut---

await fetch(presignedUrl, {
  method: "PUT",
  body: arrayBuffer,
  headers: {
    "content-type": contentType,
  },
});
```

## See also

- [Handling user video uploads](/docs/video-uploads)
