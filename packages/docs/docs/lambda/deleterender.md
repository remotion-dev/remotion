---
image: /generated/articles-docs-lambda-deleterender.png
id: deleterender
title: deleteRender()
slug: /lambda/deleterender
crumb: "Lambda API"
---

Deletes a rendered video, audio or still and its associated metada.

```ts twoslash
// @module: ESNext
// @target: ESNext
import { deleteRender } from "@remotion/lambda";

const { freedBytes } = await deleteRender({
  bucketName: "remotionlambda-r42fs9fk",
  region: "us-east-1",
  renderId: "8hfxlw",
});

console.log(freedBytes); // 21249541
```

## Arguments

An object with the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) in which the render has performed.

### `bucketName`

The bucket name in which the render was stored. This should be the same variable you used for [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) or [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda).

### `renderId`

The ID of the render. You can retrieve this ID by calling [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) or [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda).

### `customCredentials`

_optional, available from v3.2.23_

If the render was saved to a [different cloud](/docs/lambda/custom-destination#saving-to-another-cloud), pass an object with the same `endpoint`, `accessKeyId` and `secretAccessKey` as you passed to [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#outname) or [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#outname).

## Return value

Returns a promise resolving to an object with the following properties:

### `freedBytes`

The amount of bytes that were removed from the S3 bucket.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/delete-render.ts)
