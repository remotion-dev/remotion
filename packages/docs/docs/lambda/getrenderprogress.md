---
image: /generated/articles-docs-lambda-getrenderprogress.png
id: getrenderprogress
title: getRenderProgress()
slug: /lambda/getrenderprogress
crumb: "Lambda API"
---

Gets the current status of a render originally triggered via [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda).

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { getRenderProgress } from "@remotion/lambda";

// ---cut---

const progress = await getRenderProgress({
  renderId: "d7nlc2y",
  bucketName: "remotionlambda-d9mafgx",
  functionName: "remotion-render-la8ffw",
  region: "us-east-1",
});
```

## API

Call the function by passing an object with the following properties:

### `renderId`

The unique identifier for the render that you want to get the progress for. You can get the renderId from the return value of [`renderMediaOnLambda()`](/docs/lambda/renderMediaonlambda).

### `bucketName`

The bucket in which information about the render is saved. You can get the bucket name from the return value of [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda).

### `region`

The region in which the Lambda function is located in.

### `functionName`

The name of the function that triggered the render.

### `customCredentials`

_optional, available from v3.2.23_

If the render is going to be saved to a [different cloud](/docs/lambda/custom-destination#saving-to-another-cloud), pass an object with the same `endpoint`, `accessKeyId` and `secretAccessKey` as you passed to [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#outname) or [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#outname).

## Response

Returns a promise resolving to an object with the following properties:

### `overallProgress`

A number between 0 and 1 indicating the approximate progress of the render.

### `chunks`

How many chunks have been fully rendered so far.

### `done`

`true` if video has been successfully rendered and all processes are done. `false` otherwise.

### `encodingStatus`

Either `null` if not all chunks have been rendered yet or an object with the signature `{framesEncoded: number}` that tells how many frames have been stitched together so far in the concatenation process.

### `costs`

Non-binding information about how much the render is costing. At the moment the calculation is still very inaccurate (on the conservative size, probably shows higher cost than real).

### `renderId`

Mirrors the `renderId` that has been passed as an input

### `renderMetadata`

Contains the following information about the render:

- `totalFrames`: The duration of the video
- `startedDate`: Timestamp of when the rendering process started.
- `totalChunks`: Into how many pieces the rendering is divided.
- `estimatedTotalLambdaInvokations`: The estimated amount of total Lambda function calls in total, excluding calls to `getRenderProgress()`.
- `estimatedRenderLambdaInvokations`: The estimated amount of Lambdas that will render chunks of the video.
- `compositionId`: The ID of the composition that is being rendered.
- `codec`: The selected codec into which the video gets encoded.

### `bucket`

In which bucket the render and other artifacts get saved.

### `outputFile`

`null` if the video is not yet rendered, a `string` containing a URL pointing to the final artifact if the video finished rendering.

### `outKey`

`null` if the video is not yet rendered, a `string` containing the S3 key where the final artifact is stored.

### `timeToFinish`

`null` is the video is not yet rendered, a `number` describing how long the render took to finish in miliseconds.

### `errors`

An array which contains errors that occured.

### `fatalErrorEncountered`

`true` if an error occured and the video cannot be rendered. You should stop polling for progress and check the `errors` array.

### `currentTime`

The current time at which the Lambda function responded to the progress request.

### `renderSize`

How many bytes have been saved to the S3 bucket as a result of this render.

### `lambdasInvoked`

How many lambdas that render a chunk have been invoked yet and have started rendering.

### `costs`

An object describing the costs of the render so far. The cost may increase if the render has not finished yet. Only costs for AWS Lambda are estimated, not for S3 storage. It is a best-effort estimation, but without any guarantees. The object has the following properties:

- `accruedSoFar`: The cost as a floating number.
- `currency`: The currency of the cost.
- `displayCost`: The cost formatted as a string.
- `disclaimer`: Textual disclaimer removing any doubt that there is no guarantee.

### `mostExpensiveFrameRanges`

If the render is in progress, this is `null`. If the render is done, it is an array of the 5 most expensive chunks in the following shape:

- `chunk`: The index of the chunk (starting from 0)
- `timeInMilliseconds`: The time it took the render that chunk
- `frameRange`: A tuple containing the first and last frame that was rendered in that chunk.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-render-progress.ts)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
