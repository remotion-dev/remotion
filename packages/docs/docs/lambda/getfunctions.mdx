---
image: /generated/articles-docs-lambda-getfunctions.png
title: getFunctions()
id: getfunctions
slug: /lambda/getfunctions
crumb: 'Lambda API'
---

Retrieves a list of functions that Remotion deployed to AWS Lambda in a certain region.

The parameter `compatibleOnly` determines whether only functions that are compatible with the installed version of Remotion Lambda should be returned.

:::note
The Lambda function is versioned and the version of the function must match the version of the `@remotion/lambda` package. So if you upgrade Remotion, you should deploy a new function or otherwise you might get an empty array from this function.
:::

To get information about only a single function, use [`getFunctionInfo()`](/docs/lambda/getfunctioninfo).

If you are sure that a function exists, you can also guess the name of it using [`speculateFunctionName()`](/docs/lambda/speculatefunctionname) and save an API call to Lambda.

## Example

```ts twoslash
import {getFunctions} from '@remotion/lambda/client';

const info = await getFunctions({
  region: 'eu-central-1',
  compatibleOnly: true,
});

for (const fn of info) {
  console.log(fn.functionName); // "remotion-render-d8a03x"
  console.log(fn.memorySizeInMb); // 1536
  console.log(fn.timeoutInSeconds); // 120
  console.log(fn.diskSizeInMb); // 2048
  console.log(fn.version); // "2021-07-25"
}
```

:::note
Preferrably import this function from `@remotion/lambda/client` to avoid problems [inside serverless functions](/docs/lambda/light-client).
:::

## Argument

An object containing the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) that you would like to query.

### `logLevel?`<AvailableFrom v="4.0.115"/>

<Options id="log" />

### `compatibleOnly`

If `true`, only functions that match the version of the current Remotion Lambda package are returned. If `false`, all functions are returned.

## Return value

A promise resolving to an **array of objects** with the following properties:

### `functionName`

The name of the function.

### `memorySizeInMb`

The amount of memory allocated to the function.

### `diskSizeInMb`

The amount of ephemereal disk storage allocated to the function.

### `version`

The version of the function. Remotion is versioning the Lambda function and a render can only be triggered from a version of `@remotion/lambda` that is matching the one of the function.

### `timeoutInSeconds`

The timeout that has been assigned to the Lambda function.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-functions.ts)
- [`getFunctionInfo()`](/docs/lambda/getfunctioninfo)
- [`deployFunction()`](/docs/lambda/deployfunction)
- [`deleteFunction()`](/docs/lambda/deletefunction)
