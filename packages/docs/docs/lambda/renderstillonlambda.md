---
image: /generated/articles-docs-lambda-renderstillonlambda.png
id: renderstillonlambda
title: renderStillOnLambda()
slug: /lambda/renderstillonlambda
crumb: "Lambda API"
---

Renders a still image inside a lambda function and writes it to the specified output location.

If you want to render a video or audio instead, use [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) instead.

If you want to render a still locally instead, use [`renderStill()`](/docs/renderer/render-still) instead.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { renderStillOnLambda } from "@remotion/lambda/client";

const { estimatedPrice, url, sizeInBytes } = await renderStillOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  composition: "MyVideo",
  inputProps: {},
  imageFormat: "png",
  maxRetries: 1,
  privacy: "public",
  envVariables: {},
  frame: 10,
});
```

:::note
Preferrably import this function from `@remotion/lambda/client` to avoid problems [inside serverless functions](/docs/lambda/light-client).
:::

## Arguments

An object with the following properties:

### `region`

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `functionName`

The name of the deployed Lambda function.
Use [`deployFunction()`](/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/lambda/deploysite) to deploy a Remotion project.

### `composition`

The `id` of the [composition](/docs/composition) you want to render..

### `inputProps`

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `privacy`

One of:

- `"public"` (_default_): The rendered still is publicly accessible under the S3 URL.
- `"private"`: The rendered still is not publicly available, but signed links can be created using [presignUrl()](/docs/lambda/presignurl).
- `"no-acl"` (_available from v.3.1.7_): The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](#outname).

### `frame?`

_optional - default `0`_

Which frame of the composition should be rendered. Frames are zero-indexed.

From v3.2.27, negative values are allowed, with `-1` being the last frame.

### `imageFormat?`

_optional - default `"png"`_

See [`renderStill() -> imageFormat`](/docs/renderer/render-still#imageformat).

### `jpegQuality?`

_optional_

Sets the quality of the generated JPEG images. Must be an integer between 0 and 100. Default is to leave it up to the browser, [current default is 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

Only applies if `imageFormat` is `"jpeg"`, otherwise this option is invalid.

### ~~`quality?`~~

Renamed to `jpegQuality` in `v4.0.0`.

### `maxRetries?`

_optional - default `1`_

How often a frame render may be retried until it fails.

### `envVariables?`

_optional - default `{}`_

See [`renderStill() -> envVariables`](/docs/renderer/render-still#envvariables).

### `forceHeight?`

_optional, available from v3.2.40_

Overrides the default composition height.

### `forceWidth?`

_optional, available from v3.2.40_

Overrides the default composition width.

### `scale?`

_optional_

Scales the output dimensions by a factor. See [Scaling](/docs/scaling) to learn more about this feature.

### `outName?`

_optional_

It can either be:

- `undefined` - it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`.
- A `string` - it will get saved to the same S3 bucket as your site under the key `renders/{renderId}/{outName}`.
- An object if you want to render to a different bucket or cloud provider - [see here for detailed instructions](/docs/lambda/custom-destination)

### `timeoutInMilliseconds?`

_optional_

A number describing how long the render may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout). Default: `30000`

### `downloadBehavior?`

_optional, available since v3.1.5_

How the output file should behave when accessed through the S3 output link in the browser.  
Either:

- `{"type": "play-in-browser"}` - the default. The video will play in the browser.
- `{"type": "download", fileName: null}` or `{"type": "download", fileName: "download.mp4"}` - a `Content-Disposition` header will be added which makes the browser download the file. You can optionally override the filename.

### `chromiumOptions?`

_optional_

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

_optional_

Specify a specific bucket name to be used. [This is not recommended](/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `logLevel?`

_optional_

One of `verbose`, `info`, `warn`, `error`. Determines how much is being logged inside the Lambda function. Logs can be read through the CloudWatch URL that this function returns.

If the `logLevel` is set to `verbose`, the `dumpBrowserLogs` flag will also be enabled.

### `dumpBrowserLogs?`

_optional, available since v3.3.83_

If set to true, all `console` statements from the headless browser will be forwarded to the CloudWatch logs.

## Return value

Returns a promise resolving to an object with the following properties:

### `bucketName`

The S3 bucket in which the video was saved.

### `output`

An AWS S3 URL where the output is available.

### `estimatedPrice`

Object containing roughly estimated information about how expensive this operation was.

### `sizeInBytes`

The size of the output image in bytes.

### `renderId`

A unique alphanumeric identifier for this render. Useful for obtaining status and finding the relevant files in the S3 bucket.

### `cloudWatchLogs`

_Available from v3.2.10_

A link to CloudWatch (if you haven't disabled it) that you can visit to see the logs for the render.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/render-still-on-lambda.ts)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
- [renderStill()](/docs/renderer/render-still)
