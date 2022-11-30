---
image: /generated/articles-docs-lambda-presignurl.png
id: presignurl
title: presignUrl()
crumb: "Lambda API"
---

Takes a private S3 object and turns it into a public URL by signing with your AWS credentials.

## Example

```ts twoslash
// @module: ESNext
// @target: ESNext
import { presignUrl } from "@remotion/lambda";

const url = await presignUrl({
  region: "us-east-1",
  bucketName: "remotionlambda-c7fsl3d",
  objectKey: "assets/sample.png",
  expiresInSeconds: 900,
  checkIfObjectExists: true,
});

console.log(url); // `null` if object doesn't exist
```

## Arguments

An object with the following properties:

### `region`

The AWS region in which the bucket resides.

### `bucketName`

The bucket where the asset exists. The bucket must have been created by Remotion Lambda.

### `objectKey`

They key that uniquely identifies the object stored in the bucket.

### `expiresInSeconds`

The number of seconds before the presigned URL expires.
Must be an integer and `>=1` and `<=604800` (maximum of 7 days as enforced by AWS)

### `checkIfObjectExists`

Whether the function should check if the object exists in the bucket before generating the presigned url. Default `false`.

If the object does not exist and `checkIfObjectExists` is:

- `true`, then `null` is returned
- `false`, then an exception is thrown

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/presign-url.ts)
- [`downloadMedia()`](/docs/lambda/downloadmedia)
