---
id: deploylambda
title: deployLambda()
slug: /lambda/deploylambda
---

Creates an [AWS Lambda](https://aws.amazon.com/lambda/) function in your AWS account that will be able to render a video in the cloud.

Before calling `deployLambda()`, you need to deploy the necessary binaries and obtain the identifier for the Lambda Layer. You can do so by calling [`ensureLambdaBinaries()`](/docs/lambda/ensurelambdabinaries).

## Example

```ts
import {deployLambda, ensureLambdaBinaries} from '@remotion/lambda';

// ...

const {layerArn} = await ensureLambdaBinaries('us-east-1');
const {functionName} = await deployLambda({
  layerArn,
  region: 'us-east-1',
  timeoutInSeconds: 120
});
console.log(functionName)
```

## Arguments

An object with the following properties:

### `layerArn`

The [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the Lambda Layer that should be used. You can obtain it by calling [`ensureLambdaBinaries()`](/docs/ensurelambdabinaries).

### `region`

The AWS region which you want to deploy the Lambda function too. It must be the same region that your Lambda Layer resides in.

### `timeoutInSeconds`

How long the Lambda function may run before it gets killed. Must be below 900 seconds.
We recommend a timeout of 120 seconds or lower - remember, Remotion Lambda is the fastest if you render with a high concurrency. If your video takes longer to render, the concurrency should be increased rather than the timeout.

## Return value

An object with the following values:

- `functionName` (_string_): The name of the function just created.
