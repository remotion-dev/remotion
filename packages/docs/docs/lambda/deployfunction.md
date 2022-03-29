---
id: deployfunction
title: deployFunction()
slug: /lambda/deployfunction
---

Creates an [AWS Lambda](https://aws.amazon.com/lambda/) function in your AWS account that will be able to render a video in the cloud.

If a function with the same version, memory size and timeout already existed, it will be returned instead without a new one being created. This means this function can be treated as idempotent.

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import { deployFunction } from "@remotion/lambda";

const { functionName } = await deployFunction({
  region: "us-east-1",
  timeoutInSeconds: 120,
  memorySizeInMb: 1024,
  createCloudWatchLogGroup: true,
  architecture: "arm64",
  diskSizeInMb: 512,
});
console.log(functionName);
```

## Arguments

An object with the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) which you want to deploy the Lambda function too. It must be the same region that your Lambda Layer resides in.

### `timeoutInSeconds`

How long the Lambda function may run before it gets killed. Must be below 900 seconds.
We recommend a timeout of 120 seconds or lower - remember, Remotion Lambda is the fastest if you render with a high concurrency. If your video takes longer to render, the concurrency should be increased rather than the timeout.

### `memorySizeInMb`

How many megabytes of RAM the Lambda function should have. By default we recommend a value of 1024MB. You may increase or decrease it depending on how memory-consuming your video is. The minimum allowed number is `512`, the maximum allowed number is `10240`. Since the costs of Remotion Lambda is directly proportional to the amount of RAM, we recommend to keep this amount as low as possible.

### `architecture`

Either `x86_64` or `arm64`.

### `createCloudWatchLogGroup`

Whether logs should be saved into CloudWatch. We recommend enabling this option.

### `cloudWatchLogRetentionPeriodInDays`

Optional. Retention period for the CloudWatch Logs. Default: 14 days.

### `diskSizeInMb`

Optional. Sets the amount of disk storage that is available in the Lambda function. Must be between 512MB and 10240MB (10GB). Set this higher if you want to render longer videos. See also: [Disk size](/docs/lambda/disk-size)

## Return value

An object with the following values:

- `functionName` (_string_): The name of the function just created.
- `alreadyExisted`: (_boolean_): Whether the creation was skipped because the function already existed.

## See also

- [deleteFunction()](/docs/lambda/deletefunction)
- [getFunctions()](/docs/lambda/getfunctions)
