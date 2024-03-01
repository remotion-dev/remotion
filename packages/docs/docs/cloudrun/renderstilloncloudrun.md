---
image: /generated/articles-docs-cloudrun-renderstilloncloudrun.png
id: renderstilloncloudrun
title: renderStillOnCloudrun()
crumb: "Cloud Run API"
---

<ExperimentalBadge>
<p>Cloud Run is in <a href="/docs/cloudrun-alpha">Alpha</a>, which means APIs may change in any version and documentation is not yet finished. See the <a href="https://remotion.dev/changelog">changelog to stay up to date with breaking changes</a>.</p>
</ExperimentalBadge>

Kicks off a still rendering process on Remotion Cloud Run.

Requires a [service](/docs/cloudrun/deployservice) to already be deployed to execute the render.  
A [site](/docs/cloudrun/deploysite) or a [Serve URL](/docs/terminology/serve-url) needs to be specified to determine what will be rendered.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
// ---cut---
import { renderStillOnCloudrun } from "@remotion/cloudrun";

const result = await renderStillOnCloudrun({
  region: "us-east1",
  serviceName: "remotion-render-bds9aab",
  composition: "MyStill",
  imageFormat: "png",
  serveUrl:
    "https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh",
});

if (result.type === "success") {
  console.log(result.bucketName);
  console.log(result.renderId);
}
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

In which [GCP region](/docs/cloudrun/region-selection) your Cloud Run service is deployed. It's highly recommended that your Remotion site is also in the same region.

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/cloudrun/deploysite) to deploy a Remotion project.

### `composition`

The `id` of the [composition](/docs/composition) you want to render.

### `inputProps?`

_optional_

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `privacy?`

_optional_

One of:

- `"public"` (_default_): The rendered still is publicly accessible under the Cloud Storage URL.
- `"private"`: The rendered still is not publicly available, but is available within the GCP project to those with the correct permissions.

### `forceBucketName?`

_optional_

Specify a specific bucket name to be used for the output. The resulting Google Cloud Storage URL will be in the format `gs://{bucket-name}/renders/{render-id}/{file-name}`. If not set, Remotion will choose the right bucket to use based on the region.

### `jpegQuality?`

_optional_

See [`renderStill() -> jpegQuality`](/docs/renderer/render-still#jpegquality).

### `imageFormat?`

_optional_

See [`renderStill() -> imageFormat`](/docs/renderer/render-still#imageformat).

### `scale?`

_optional_

Scales the output dimensions by a factor. See [Scaling](/docs/scaling) to learn more about this feature.

### `envVariables?`

_optional_

See [`renderStill() -> envVariables`](/docs/renderer/render-still#envvariables).

### `frame?`

_optional_

Which frame of the composition should be rendered. Frames are zero-indexed, and negative values are allowed, with -1 being the last frame.

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

<Options id="gl"  />

### `forceWidth?`

_optional_

Overrides default composition width.

### `forceHeight?`

_optional_

Overrides default composition height.

### `logLevel?`

<Options id="log"/>

### `outName?`

_optional_

The file name of the still output.

It can either be:

- `undefined` - it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`.
- A `string` - it will get saved to the same Cloud Storage bucket as your site under the key `renders/{renderId}/{outName}`. Make sure to include the file extension at the end of the string.

### `delayRenderTimeoutInMilliseconds?`

_optional_

A number describing how long the render may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout). Default: `30000`

### `offthreadVideoCacheSizeInBytes?`<AvailableFrom v="4.0.23"/>

<Options id="offthreadvideo-cache-size-in-bytes" />

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

Size of the rendered still in KB.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/render-still-on-cloudrun.ts)
