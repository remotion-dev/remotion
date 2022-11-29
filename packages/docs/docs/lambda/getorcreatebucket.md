---
id: getorcreatebucket
title: getOrCreateBucket()
slug: /lambda/getorcreatebucket
crumb: "Lambda API"
---

Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.

**Only 1 bucket per region** is necessary for Remotion Lambda to function.

```ts twoslash
// @module: ESNext
// @target: ESNext
import { getOrCreateBucket } from "@remotion/lambda";

const { bucketName } = await getOrCreateBucket({ region: "us-east-1" });

console.log(bucketName); // "remotionlambda-32df3p"
```

## Arguments

An object with the following property:

### `region`

The [AWS region](/docs/lambda/region-selection) which you want to create a bucket in.

### `onBucketEnsured?`

_optional_

Allows to pass a callback after the bucket was created and before the S3 website option was enabled. This option exists so the CLI can better visualize the progress.

## Return value

A promise resolving to an object with the following property:

### `bucketName`

The name of your bucket that was found or created.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-or-create-bucket.ts)
- [getFunctions()](/docs/lambda/getfunctions)
