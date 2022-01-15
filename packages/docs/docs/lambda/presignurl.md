---
id: presignurl
title: presignUrl()
slug: /lambda/presignurl
---

Returns a presigned url for public access of an object stored in Remotion's S3 bucket.

## Example

```ts twoslash
import { presignUrl } from "@remotion/lambda";

const url = await presignUrl({
	region: "us-east-1",
	bucketName: "remotionlambda-c7fsl3d",
	objectKey: "assets/sample.png",
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

### `checkIfObjectExists`

Whether the function should check if the object exists in the bucket before generating the presigned url. Default false.

### `expiresIn`

The number of seconds before the presigned URL expires. Default 120.

## See also

- [`getS3Object()`](/docs/lambda/gets3object)
