---
image: /generated/articles-docs-cloudrun-rendermediaoncloudrun.png
id: rendermediaoncloudrun
title: renderMediaOnCloudrun()
crumb: "Cloud Run API"
---

import { MinimumFramesPerLambda } from "../../components/lambda/default-frames-per-lambda";

Kicks off a media rendering process on Remotion Cloud Run.

Requires a [service](/docs/cloudrun/deployservice) to already be deployed to execute the render.  
A [site](/docs/cloudrun/deploysite) or a [Serve URL](/docs/terminology#serve-url) needs to be specified to determine what will be rendered.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
// ---cut---
import { renderMediaOnCloudrun } from "@remotion/cloudrun";

const result = await renderMediaOnCloudrun({
  region: "us-east1",
  serviceName: "remotion-render-bds9aab",
  composition: "MyVideo",
  serveUrl:
    "https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh",
  codec: "h264",
});

console.log(result.bucketName);
console.log(result.renderId);
```

## Arguments

An object with the following properties:

### `cloudRunUrl?`

_optional. Required if serviceName not supplied_

The url of the Cloud Run service which should be used to perform the render. You must set either cloudRunUrl or serviceName, but not both

### `serviceName?`

_optional. Required if cloudRunUrl not supplied_

The name of the Cloud Run service which should be used to perform the render. This is used in conjunction with the region to determine the service endpoint, as the same service name can exist across multiple regions.

### `region`

In which region your Cloud Run service is deployed. It's highly recommended that your Remotion site is also in the same region.

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/cloudrun/deploysite) to deploy a Remotion project.

### `composition`

The `id` of the [composition](/docs/composition) you want to render.

### `codec`

Which codec should be used to encode the video.

Video codecs `h264`, `vp8` and `prores` are supported.

Audio codecs `mp3`, `aac` and `wav` are also supported.

See also [`renderMedia() -> codec`](/docs/renderer/render-media#codec).

### `inputProps?`

_optional_

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `privacy?`

_optional_

One of:

- `"public"` (_default_): The rendered media is publicly accessible under the Cloud Storage URL.
- `"private"`: The rendered media is not publicly available, but is available within the GCP project to those with the correct permissions.

### `forceBucketName?`

_optional_

Specify a specific bucket name to be used for the output. The resulting Google Cloud Storage URL will be in the format `gs://{bucket-name}/renders/{render-id}/{file-name}`. If not set, Remotion will choose the right bucket to use based on the region.

### `updateRenderProgress?`

_optional_

A callback that is called with the progress of the render.

### `audioCodec?`

_optional_

Choose the encoding of your audio.

- Choose `pcm-16` if you need uncompressed audio.
- Not all video containers support all audio codecs.
- This option takes precedence if the `codec` option also specifies an audio codec.

Refer to the [Encoding guide](/docs/encoding/#audio-codec) to see defaults and supported combinations.

### `jpegQuality?`

_optional_

See [`renderMedia() -> jpegQuality`](/docs/renderer/render-media#jpegquality).

### `audioBitrate?`

_optional_

See [`renderMedia() -> audioBitrate`](/docs/renderer/render-media#audiobitrate).

### `videoBitrate?`

_optional_

See [`renderMedia() -> videoBitrate`](/docs/renderer/render-media#videobitrate).

### `proResProfile?`

_optional_

See [`renderMedia() -> proResProfile`](/docs/renderer/render-media#proresprofile).

### `crf?`

_optional_

See [`renderMedia() -> crf`](/docs/renderer/render-media#crf).

### `pixelFormat?`

_optional_

See [`renderMedia() -> pixelFormat`](/docs/renderer/render-media#pixelformat).

### `imageFormat?`

_optional_

See [`renderMedia() -> imageFormat`](/docs/renderer/render-media#imageformat).

### `scale?`

_optional_

Scales the output dimensions by a factor. See [Scaling](/docs/scaling) to learn more about this feature.

### `everyNthFrame?`

_optional_

Renders only every nth frame. For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](/docs/render-as-gif)

### `numberOfGifLoops?`

_optional_

[Set the looping behavior.](/docs/config#setnumberofgifloops) This option may only be set when rendering GIFs. [See here for more details.](/docs/render-as-gif#changing-the-number-of-loops)

### `frameRange?`

_optional_

Specify a single frame (a number) or a range of frames (a tuple [number, number]) to be rendered.

### `envVariables?`

_optional_

See [`renderMedia() -> envVariables`](/docs/renderer/render-media#envvariables).

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

### `muted?`

_optional_

Disables audio output. See also [`renderMedia() -> muted`](/docs/renderer/render-media#muted).

### `forceWidth?`

_available_

Overrides default composition width.

### `forceHeight?`

_available_

Overrides default composition height.

### `logLevel?`

_available_

One of `verbose`, `info`, `warn`, `error`. Determines how much is being logged inside the Lambda function. Defaults to `info`.

### `outName?`

_optional_

The file name of the media output.

It can either be:

- `undefined` - it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`.
- A `string` - it will get saved to the same Cloud Storage bucket as your site under the key `renders/{renderId}/{outName}`.

## Return value

Returns a promise resolving to an object containing the following:

### `renderId`

A unique alphanumeric identifier for this render. Useful for obtaining status and finding the relevant files in the Cloud Storage bucket.

### `bucketName`

The Cloud Storage bucket name in which all files are being saved.

### `privacy`

Privacy of the output file, either:

- "public-read" - Publicly accessible under the Cloud Storage URL.
- "project-private" - Not publicly available, but is available within the GCP project to those with the correct permissions.

### `publicUrl`

If the privacy is set to public, this will be the publicly accessible URL of the rendered file. If the privacy is not public, this will be null.

### `cloudStorageUri`

Google Storage path, beginning with `gs://{bucket-name}`. Can be used with the [gsutil](https://cloud.google.com/storage/docs/gsutil) CLI tool.

### `size`

Size of the rendered media in KB.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/render-media-on-cloudrun.ts)
