---
id: downloadmedia
title: downloadMedia()
slug: /lambda/downloadmedia
---

Downloads a rendered video, audio or still to your local disk.

```ts twoslash
// @module: ESNext
// @target: ESNext
import { downloadMedia } from "@remotion/lambda";

const { outputPath, sizeInBytes } = await downloadMedia({
  bucketName: "remotionlambda-r42fs9fk",
  region: "us-east-1",
  renderId: "8hfxlw",
  outPath: "out.mp4",
  onProgress: ({ totalSize, downloaded, percent }) => {
    console.log(
      `Download progress: ${totalSize}/${downloaded} bytes (${(
        percent * 100
      ).toFixed(0)}%)`
    );
  },
});

console.log(outputPath); // "/Users/yourname/remotion-project/out.mp4"
console.log(sizeInBytes); // 21249541
```

## Arguments

An object with the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) in which the render has performed.

### `bucketName`

The bucket name in which you the render was stored. This should be the same variable you used for `renderMediaOnLambda()`.

### `renderId`

The ID of the render. You can retrieve this ID by calling [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) or [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda).

### `outPath`

Where the video should be saved. Pass an absolute path, or it will be resolved relative to your current working directory.

### `onProgress`

Callback function that gets called with the following properties:

- `totalSize` in bytes
- `downloaded` number of bytes downloaded
- `percent` relative progress between 0 and 1

## Return value

Returns a promise resolving to an object with the following properties:

### `outputPath`

The absolute path of where the file got saved.

### `sizeInBytes`

The size of the file in bytes.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/download-media.ts)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
- [renderStillOnLambda()](/docs/lambda/renderstillonlambda)
