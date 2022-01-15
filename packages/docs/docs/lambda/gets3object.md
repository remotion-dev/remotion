---
id: gets3object
title: getS3Object()
slug: /lambda/gets3object
---

Retrieves an object stored in Remotion's S3 bucket.

## Example

```ts twoslash
import fs from "fs";
import { getS3Object } from "@remotion/lambda";

const data = await getS3Object({
	region: 'us-east-1',
	bucketName: 'remotionlambda-fz1zu45ztk',
	objectKey: 'assets/sample.jpeg',
});

const file = fs.createWriteStream('sample.jpeg');
data.pipe(file);
```

## Arguments

An object with the following properties:

### `region`

The AWS region in which the bucket resides.

### `bucketName`

The bucket where the asset exists. The bucket must have been created by Remotion Lambda.

### `objectKey`

They key that uniquely identifies the object stored in the bucket.

## See also

- [`presignUrl()`](/docs/lambda/presignurl)
