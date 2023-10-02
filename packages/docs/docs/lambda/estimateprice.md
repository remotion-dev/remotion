---
image: /generated/articles-docs-lambda-estimateprice.png
id: estimateprice
title: estimatePrice()
slug: /lambda/estimateprice
crumb: "Lambda API"
---

Calculates the AWS costs incurred for AWS Lambda given the region, execution duration and memory size based on the AWS Lambda pricing matrix.

During rendering, many Lambda functions are spawned:

- The main function spawns many worker functions, waits for chunks to be rendered, and stitches them together for the full video. This is the longest-running Lambda function.
- Render functions render a short portion of a video and then shut down.
- Other short-lived, negligible functions get launched for initializing lambdas and fetching progress.

The total duration is the sum of execution duration of all of the above Lambda functions.
This duration can be passed to `estimatePrice()` to estimate the cost of AWS Lambda.

The calculated duration does not include costs for S3 and Remotion licensing fees.

## Example

```ts twoslash
import { estimatePrice } from "@remotion/lambda";

console.log(
  estimatePrice({
    region: "us-east-1",
    durationInMilliseconds: 20000,
    memorySizeInMb: 2048,
    diskSizeInMb: 2048,
    lambdasInvoked: 1,
  })
); // 0.00067
```

## Arguments

An object containing the following parameters:

### `region`

The region in which the Lambda function is executed in. [Pricing varies across regions](/docs/lambda/region-selection#other-considerations).

### `memorySizeInMb`

The amount of memory that has been given to the Lambda function. May be received with [`getFunctionInfo()`](/docs/lambda/getfunctioninfo).

### `durationInMilliseconds`

The estimated total execution duration in Milliseconds of all Lambdas combined. See the top of this page for a guide on how to approximate the duration.

### `lambdasInvoked`

The number of lambdas that were invoked in the rendering process.

### `diskSizeInMb`

The amount of disk space allocated in megabytes.

## Return value

The estimated cost in USD as a `number`.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/estimate-price.ts)
