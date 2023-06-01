---
image: /generated/articles-docs-lambda-getorcreatebucket.png
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

### ~~`onBucketEnsured?`~~

_removed in v4.0, optional_

Allows to pass a callback after the bucket was created and before the S3 website option was enabled. This option exists so the CLI can better visualize the progress.  
Removed in v4.0 since we don't use the website option anymore.

## Return value

A promise resolving to an object with the following properties:

### `bucketName`

The name of your bucket that was found or created.

### `alreadyExisted`<AvailableFrom v="3.3.78" />

A boolean indicating whether the bucket already existed or was newly created.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-or-create-bucket.ts)
- [getFunctions()](/docs/lambda/getfunctions)
