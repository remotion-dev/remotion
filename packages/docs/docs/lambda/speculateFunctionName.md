---
image: /generated/articles-docs-lambda-speculateFunctionName.png
id: speculatefunctionname
title: speculateFunctionName()
slug: /lambda/speculatefunctionname
crumb: "Lambda API"
---

_available from v3.3.67_

Speculate the name of the Lambda function that will be created by [deployFunction()](/docs/lambda/deployfunction) or its CLI equivalent, [`npx remotion lambda functions deploy`](/docs/lambda/cli/functions). This could be useful in cases when the configuration of the Lambda function is known in advance, and the name of the function is needed.

If you are not sure whether a function exists, use [`getFunctionInfo()`](/docs/lambda/getfunctioninfo) and catch the error that gets thrown if it does not exist.

If you want to get a list of deployed functions, use [`getFunctions()`](/docs/lambda/getfunctions) instead.

## Function name pattern

The function name depends on the following parameters:

- Remotion version
- Memory size
- Disk size
- Timeout

The name of the function resembles the following pattern:

```
remotion-render-3-3-63-mem2048mb-disk2048mb-240sec
                ^^^^^^    ^^^^       ^^^    ^^^
                  |         |         |      |-- Timeout in seconds
                  |         |         |--------- Disk size in MB
                  |         |------------------- Memory size in MB
                  |----------------------------- Remotion version with dots replaced by dashes
```

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import { speculateFunctionName } from "@remotion/lambda/client";

const speculatedFunctionName = await speculateFunctionName({
  memorySizeInMb: 2048,
  diskSizeInMb: 2048,
  timeoutInSeconds: 120,
});

console.log(speculatedFunctionName); // remotion-render-3-3-63-mem2048mb-disk2048mb-120sec
```

## Arguments

An object with the following properties:

### `memorySizeInMb`

The amount of memory allocated to the function.

### `diskSizeInMb`

The amount of disk space allocated to the function.

### `timeoutInSeconds`

The timeout that has been assigned to the Lambda function.

## Return value

A string with the name of the function that will be created.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/speculate-function-name.ts)
- [deployFunction()](/docs/lambda/deployfunction)
- CLI version of `deployFunction()`: [`npx remotion lambda functions deploy`](/docs/lambda/cli/functions#deploy)
