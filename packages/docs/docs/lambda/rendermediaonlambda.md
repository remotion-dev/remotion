---
image: /generated/articles-docs-lambda-rendermediaonlambda.png
id: rendermediaonlambda
title: renderMediaOnLambda()
crumb: "Lambda API"
---

import { MinimumFramesPerLambda } from "../../components/lambda/default-frames-per-lambda";

Kicks off a render process on Remotion Lambda. The progress can be tracked using [getRenderProgress()](/docs/lambda/getrenderprogress).

Requires a [function](/docs/lambda/deployfunction) to already be deployed to execute the render.  
A [site](/docs/lambda/deploysite) or a [Serve URL](/docs/terminology#serve-url) needs to be specified to determine what will be rendered.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
// ---cut---
import { renderMediaOnLambda } from "@remotion/lambda/client";

const { bucketName, renderId } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  composition: "MyVideo",
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  codec: "h264",
});
```

:::note
Preferrably import this function from `@remotion/lambda/client` to avoid problems [inside serverless functions](/docs/lambda/light-client).
:::

## Arguments

An object with the following properties:

### `region`

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `privacy`

_optional since v3.2.27_

One of:

- `"public"` (_default_): The rendered media is publicly accessible under the S3 URL.
- `"private"`: The rendered media is not publicly available, but signed links can be created using [presignUrl()](/docs/lambda/presignurl).
- `"no-acl"` (_available from v.3.1.7_): The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](#outname).

### `functionName`

The name of the deployed Lambda function.
Use [`deployFunction()`](/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `framesPerLambda?`

_optional_

The video rendering process gets distributed across multiple Lambda functions. This setting controls how many frames are rendered per Lambda invocation. The lower the number you pass, the more Lambdas get spawned.

Default value: [Dependant on video length](/docs/lambda/concurrency)  
Minimum value: <MinimumFramesPerLambda />

:::note
The `framesPerLambda` parameter cannot result in more than 200 functions being spawned. See: [Concurrency](/docs/lambda/concurrency)
:::

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/lambda/deploysite) to deploy a Remotion project.

### `composition`

The `id` of the [composition](/docs/composition) you want to render.

### `inputProps`

_optional since v3.2.27_

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `codec`

Which codec should be used to encode the video.

Video codecs `h264` and `vp8` are supported, `prores` is supported since `v3.2.0`.

Audio codecs `mp3`, `aac` and `wav` are also supported.

The option `h264-mkv` has been renamed to just `h264` since `v3.3.34`. Use `h264` to get the same behavior.

See also [`renderMedia() -> codec`](/docs/renderer/render-media#codec).

### `audioCodec?`

_optional_
_"pcm-16" | "aac" | "mp3" | "opus", available from v3.3.41_

Choose the encoding of your audio.

- Each Lambda chunk might actually choose an uncompressed codec and convert it in the final encoding stage to prevent audio artifacts.
- The default is dependent on the chosen `codec`.
- Choose `pcm-16` if you need uncompressed audio.
- Not all video containers support all audio codecs.
- This option takes precedence if the `codec` option also specifies an audio codec.

Refer to the [Encoding guide](/docs/encoding/#audio-codec) to see defaults and supported combinations.

### `forceHeight?`

_optional, available from v3.2.40_

Overrides default composition height.

### `forceWidth?`

_optional, available from v3.2.40_

Overrides default composition width.

### `muted?`

_optional_

Disables audio output. See also [`renderMedia() -> muted`](/docs/renderer/render-media#muted).

### `imageFormat`

_optional since v3.2.27_

See [`renderMedia() -> imageFormat`](/docs/renderer/render-media#imageformat).

### `crf?`

_optional_

See [`renderMedia() -> crf`](/docs/renderer/render-media#crf).

### `envVariables?`

_optional_

See [`renderMedia() -> envVariables`](/docs/renderer/render-media#envvariables).

### `pixelFormat?`

_optional_

See [`renderMedia() -> pixelFormat`](/docs/renderer/render-media#pixelformat).

### `proResProfile?`

_optional_

See [`renderMedia() -> proResProfile`](/docs/renderer/render-media#proresprofile).

### `jpegQuality`

See [`renderMedia() -> jpegQuality`](/docs/renderer/render-media#jpegquality).

### ~~`quality`~~

Renamed to `jpegQuality` in v4.0.0.

### `audioBitrate?`

_optional_

See [`renderMedia() -> audioBitrate`](/docs/renderer/render-media#audiobitrate).

### `videoBitrate?`

_optional_

See [`renderMedia() -> videoBitrate`](/docs/renderer/render-media#videobitrate).

### `maxRetries`

_optional since v3.2.27, default `1`_

How often a chunk may be retried to render in case the render fails.
If a rendering of a chunk is failed, the error will be reported in the [`getRenderProgress()`](/docs/lambda/getrenderprogress) object and retried up to as many times as you specify using this option.

### `scale?`

_optional_

Scales the output dimensions by a factor. See [Scaling](/docs/scaling) to learn more about this feature.

### `outName?`

_optional_

The file name of the media output.

It can either be:

- `undefined` - it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`.
- A `string` - it will get saved to the same S3 bucket as your site under the key `renders/{renderId}/{outName}`.
- An object if you want to render to a different bucket or cloud provider - [see here for detailed instructions](/docs/lambda/custom-destination)

### `timeoutInMilliseconds?`

_optional_

A number describing how long the render may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout). Default: `30000`

### `concurrencyPerLambda?`

_optional, available from v3.0.30_

By default, each Lambda function renders with concurrency 1 (one open browser tab). You may use the option to customize this value.

### `everyNthFrame?`

_optional, available from v3.1_

Renders only every nth frame. For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](/docs/render-as-gif)

### `numberOfGifLoops?`

_optional, available since v3.1_

[Set the looping behavior.](/docs/config#setnumberofgifloops) This option may only be set when rendering GIFs. [See here for more details.](/docs/render-as-gif#changing-the-number-of-loops)

### `downloadBehavior?`

_optional, available since v3.1.5_

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
The default for Lambda is `swangle`, but `null` elsewhere.
:::

### `overwrite?`

_available from v3.2.25_

If a custom out name is specified and a file already exists at this key in the S3 bucket, decide whether that file will be deleted before the render begins. Default `false`.

An existing file at the output S3 key will conflict with the render and must be deleted beforehand. If this setting is `false` and a conflict occurs, an error will be thrown.

### `rendererFunctionName?`

_optional, available from v3.3.38_

If specified, this function will be used for rendering the individual chunks. This is useful if you want to use a function with higher or lower power for rendering the chunks than the main orchestration function.

If you want to use this option, the function must be in the same region, the same account and have the same version as the main function.

### `webhook?`

_optional, available from v3.2.30_

If specified, Remotion will send a POST request to the provided endpoint to notify your application when the Lambda rendering process finishes, errors out or times out.

```tsx twoslash
import { RenderMediaOnLambdaInput } from "@remotion/lambda";

const webhook: RenderMediaOnLambdaInput["webhook"] = {
  url: "https://mapsnap.app/api/webhook",
  secret: process.env.WEBHOOK_SECRET as string,
};
```

If you don't want to set up validation, you can set `secret` to null:

```tsx twoslash
import { RenderMediaOnLambdaInput } from "@remotion/lambda";

const webhook: RenderMediaOnLambdaInput["webhook"] = {
  url: "https://mapsnap.app/api/webhook",
  secret: null,
};
```

[See here for detailed instructions on how to set up your webhook](/docs/lambda/webhooks).

### `forceBucketName?`

_optional, available from v3.3.42_

Specify a specific bucket name to be used. [This is not recommended](/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `logLevel?`

_optional_

One of `verbose`, `info`, `warn`, `error`. Determines how much is being logged inside the Lambda function. Logs can be read through the CloudWatch URL that this function returns.

If the `logLevel` is set to `verbose`, the Lambda function will not clean up artifacts, to aid debugging. Do not use it unless you are debugging a problem.

If the `logLevel` is set to `verbose`, the `dumpBrowserLogs` flag will also be enabled.

### `dumpBrowserLogs?`

_optional, available from v3.3.83_

If set to true, all `console` statements from the headless browser will be forwarded to the CloudWatch logs.

## Return value

Returns a promise resolving to an object containing two properties: `renderId`, `bucketName`, `cloudWatchLogs`. Those are useful for passing to `getRenderProgress()`

### `renderId`

A unique alphanumeric identifier for this render. Useful for obtaining status and finding the relevant files in the S3 bucket.

### `bucketName`

The S3 bucket name in which all files are being saved.

### `cloudWatchLogs`

_available from v3.2.10_

A link to CloudWatch (if you haven't disabled it) that you can visit to see the logs for the render.

### `folderInS3Console`

_available from v3.2.43_

A link to the folder in the AWS console where each chunk and render is located.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/render-media-on-lambda.ts)
- [getRenderProgress()](/docs/lambda/getrenderprogress)
