---
image: /generated/articles-docs-lambda-getcompositionsonlambda.png
id: getcompositionsonlambda
title: getCompositionsOnLambda()
slug: /lambda/getcompositionsonlambda
crumb: "Lambda API"
---

_available from v3.3.2_

Gets the compositions inside a Lambda function.

Note that you can also get the compositions of a site that is hosted on Lambda using [`getCompositions()`](/docs/renderer/get-compositions). Vice versa, you can also get the compositions from a serve URL that is not hosted on AWS Lambda using `getCompositionsOnLambda()`.

You should use `getCompositionsOnLambda()` if you cannot use [`getCompositions()`](/docs/renderer/get-compositions) because the machine cannot run Chrome.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { getCompositionsOnLambda } from "@remotion/lambda/client";

const compositions = await getCompositionsOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  inputProps: {},
});

console.log(compositions); // See below for an example value
```

:::note
Preferrably import this function from `@remotion/lambda/client` to avoid problems [inside serverless functions](/docs/lambda/light-client).
:::

## Arguments

An object with the following properties:

### `functionName`

The name of the deployed Lambda function that should be used to ge the list of compositions.
Use [`deployFunction()`](/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `region`

In which region your Lambda function is deployed.

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/lambda/deploysite) to deploy a Remotion project.

### `inputProps`

React props that can be obtained using [`getInputProps()`](/docs/get-input-props) from inside the React component while evaluating the list of compositions.

### `envVariables?`

_optional - default `{}`_

See [`renderMedia() -> envVariables`](/docs/renderer/render-media#envvariables).

### `timeoutInMilliseconds?`

A number describing how long the function may take in milliseconds to evaluate the list of compositions [before it times out](/docs/timeout). Default: `30000`

### `chromiumOptions?`

Allows you to set certain Chromium / Google Chrome flags. See: [Chromium flags](/docs/chromium-flags).

#### `disableWebSecurity`

_boolean - default `false`_

This will most notably disable CORS among other security features.

#### `ignoreCertificateErrors`

_boolean - default `false`_

Results in invalid SSL certificates, such as self-signed ones, being ignored.

#### `gl`

_string_

Select the OpenGL renderer backend for Chromium.
Accepted values:

- `"angle"`,
- `"egl"`,
- `"swiftshader"`
- `"swangle"`
- `null` - Chromiums default

:::note
The default for Lambda is `"swangle"`, but `null` elsewhere.
:::

#### `userAgent`<AvailableFrom v="3.3.83"/>

Lets you set a custom user agent that the headless Chrome browser assumes.

### `forceBucketName?`

_available from v3.3.42_

Specify a specific bucket name to be used. [This is not recommended](/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `logLevel?`

One of `verbose`, `info`, `warn`, `error`. Determines how much is being logged inside the Lambda function. Logs can be read through the CloudWatch URL that this function returns.

If the `logLevel` is set to `verbose`, the `dumpBrowserLogs` flag will also be enabled.

### `dumpBrowserLogs?`<AvailableFrom v="3.3.83" />

If set to true, all `console` statements from the headless browser will be forwarded to the CloudWatch logs.

## Return value

Returns a promise that resolves to an array of available compositions. Example value:

```ts twoslash
[
  {
    id: "HelloWorld",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 120,
    defaultProps: {
      title: "Hello World",
    },
  },
  {
    id: "Title",
    width: 1080,
    height: 1080,
    fps: 30,
    durationInFrames: 90,
    defaultProps: undefined,
  },
];
```

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-compositions-on-lambda.ts)
- [getCompositions()](/docs/renderer/get-compositions)
