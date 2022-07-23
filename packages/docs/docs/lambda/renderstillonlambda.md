---
id: renderstillonlambda
title: renderStillOnLambda()
slug: /lambda/renderstillonlambda
---

Renders a still image inside a lambda function and writes it to the specified output location.

If you want to render a video or audio instead, use [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) instead.

If you want to render a still locally instead, use [`renderStill()`](/docs/renderer/render-still) instead.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { renderStillOnLambda } from "@remotion/lambda";
// ---cut---

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

The name of the [composition](/docs/composition) you want to render..

### `inputProps`

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `privacy`

Whether the output in the S3 bucket should be public or private. Either `"private"` or `"public"`.

### `frame`

_optional - default `0`_

Which frame of the composition should be rendered.

### `imageFormat?`

_optional - default `"png"`_

The image format that you want - either `"png"` or `"jpeg"`.

### `quality?`

_optional_

Sets the quality of the generate JPEG images. Must be an integer between 0 and 100. Default is to leave it up to the browser, [current default is 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

Only applies if `imageFormat` is `"jpeg"`, otherwise this option is invalid.

### `maxRetries?`

_optional - default `1`_

How often a frame render may be retried until it fails.

### `envVariables?`

_optional - default `{}`_

See [`renderMedia() -> envVariables`](/docs/renderer/render-media#envvariables).

### `outName`

_optional_

The file name of the media output.

It can either be:

- `undefined` - it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`. The outName must match `/^([0-9a-zA-Z-!_.*'()/]+)$/g`.
- A `string` - it will get saved to the same S3 bucket as your site under the key `renders/{renderId}/{outName}`.
- An object of shape `{ key: string; bucketName: string }`. This will save the render to an arbitrary bucket with an arbitrary key. Note the following restrictions:
  - You must extend the default Remotion policy to allow read and write access to that bucket.
  - The bucket must be in the same region.
  - When calling APIs such as `downloadMedia()` or `getRenderProgress()`, you must pass the bucket name where the site resides in, not the bucket where the video gets saved.
  - The `key` must match `/^([0-9a-zA-Z-!_.*'()]+)$/g` and the bucketName must match `/^(?=^.{3,63}$)(?!^(\d+\.)+\d+$)(^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$)/`.

### `timeoutInMilliseconds?`

A number describing how long the render may take to resolve all `delayRender()` calls before it times out. Default: `30000`

### `downloadBehavior`

_optional, available since v3.1.3_

How the output file should behave when accessed through the S3 output link in the browser.  
Either:

- `{"type": "play-in-browser"}` - the default. The video will play in the browser.
- `{"type": "download", fileName: null}` or `{"type": "download", fileName: "download.mp4"}` - a `Content-Disposition` header will be added which makes the browser download the file. You can optionally override the filename.

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

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/render-still-on-lambda.ts)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
- [renderStill()](/docs/renderer/render-still)
