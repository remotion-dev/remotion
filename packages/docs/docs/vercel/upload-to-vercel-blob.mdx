---
image: /generated/articles-docs-vercel-upload-to-vercel-blob.png
title: uploadToVercelBlob()
crumb: '@remotion/vercel'
---

# uploadToVercelBlob()<AvailableFrom v="4.0.426" />

:::warning
Experimental package: We reserve the right to make breaking changes in order to correct bad design decisions until this notice is gone.
:::

Uploads a file from the sandbox to [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage. Typically used after [`renderMediaOnVercel()`](/docs/vercel/render-media-on-vercel) or [`renderStillOnVercel()`](/docs/vercel/render-still-on-vercel) to make the output publicly accessible.

## Example

```ts twoslash title="route.ts"
// @module: es2022
// @target: es2022
import {uploadToVercelBlob, addBundleToSandbox, createSandbox} from '@remotion/vercel';
const sandbox = await createSandbox();
await addBundleToSandbox({sandbox, bundleDir: '/path/to/bundle'});
// ---cut---
const {url, size} = await uploadToVercelBlob({
  sandbox,
  sandboxFilePath: '/tmp/video.mp4',
  contentType: 'video/mp4',
  blobToken: process.env.BLOB_READ_WRITE_TOKEN!,
  access: 'public',
});

console.log(`Uploaded ${size} bytes to ${url}`);
```

## Arguments

An object with the following properties:

### `sandbox`

A [`Sandbox`](https://vercel.com/docs/vercel-sandbox/sdk-reference#sandbox-class) instance.

### `sandboxFilePath`

The path to the file inside the sandbox to upload, e.g. `"/tmp/video.mp4"`.

### `blobPath?`

The destination path in Vercel Blob, e.g. `"renders/abc.mp4"`. If omitted, a random path is generated.

### `contentType`

The MIME type of the file, e.g. `"video/mp4"` or `"image/png"`.

### `blobToken`

Your Vercel Blob read/write token. Typically `process.env.BLOB_READ_WRITE_TOKEN`.

### `access`

<TsType type="VercelBlobAccess" source="@remotion/vercel" href="/docs/vercel/types#vercelblobaccess" />

The access level of the uploaded blob. Either `"public"` or `"private"`. Default: `"private"`.

## Return value

An object containing:

### `url`

The public download URL of the uploaded file.

### `size`

The size of the uploaded file in bytes.

## See also

- [`renderMediaOnVercel()`](/docs/vercel/render-media-on-vercel)
- [`renderStillOnVercel()`](/docs/vercel/render-still-on-vercel)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/vercel/src/upload-to-vercel-blob.ts)
