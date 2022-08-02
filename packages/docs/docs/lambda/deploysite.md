---
id: deploysite
title: deploySite()
slug: /lambda/deploysite
---

Takes a Remotion project, bundles it and uploads it to an S3 bucket. Once uploaded, a Lambda function can render any composition in the Remotion project by specifying the URL.

Note that the Remotion project will be deployed to a subdirectory, not the root of the domain. Therefore you must ensure that if you have specified paths in your Remotion project, they are able to handle this scenario.

Before calling this function, you should create a bucket, see [`getOrCreateBucket()`](/docs/lambda/getorcreatebucket).

## Example

```ts twoslash
// @module: esnext
// @target: es2017
import { deploySite } from "@remotion/lambda";

const { serveUrl } = await deploySite({
  entryPoint: "/Users/jonnyburger/my-remotion-video/src/index.tsx",
  bucketName: "remotionlambda-c7fsl3d",
  region: "us-east-1",
  options: {
    onBundleProgress: (progress) => {
      // Progress is between 0 and 100
      console.log(`Bundle progress: ${progress}%`);
    },
    onUploadProgress: ({
      totalFiles,
      filesUploaded,
      totalSize,
      sizeUploaded,
    }) => {
      console.log(
        `Upload progress: Total files ${totalFiles}, Files uploaded ${filesUploaded}, Total size ${totalSize}, Size uploaded ${sizeUploaded}`
      );
    },
  },
  privacy: "private"
});
console.log(serveUrl);
```

## Arguments

An object with the following properties:

### `entryPoint`

An absolute path pointing to the entry file of your Remotion project. Usually the entry file in your Remotion project is stored at `src/entry.tsx`.

### `bucketName`

The bucket to where the website will be deployed. The bucket must have been created by Remotion Lambda.

### `siteName`

_optional_

Specify the subfolder in your S3 bucket that you want the site to deploy to. If you omit this property, a new subfolder with a random name will be created. If a site already exists with the name you passed, it will be overwritten. Can only contain the following characters: `0-9`, `a-z`, `A-Z`, `-`, `!`, `_`, `.`, `*`, `'`, `(`, `)`

### `region`

The AWS region in which the bucket resides.

### `privacy`

One of:

- `"public"` (_default_): The deployed site is publicly accessible under the S3 URL.
- `"private"`: The deployed site is not publicly available, but signed links can be created using [presignUrl()](/docs/lambda/presignurl).
- `"no-acl"`: The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](#outname).

### `options`

_optional_

An object with the following properties:

#### `onBundleProgress`

_optional_

Callback from Webpack when the bundling has progressed. Passes a number between 0 and 100 to the callback, see example at the top of the page.

#### `onUploadProgress`

_optional_

Callback function that gets called when uploading of the assets has progressed. Passes an object with the following properties to the callback:

- `totalFiles` (_number_): Total number of files in the bundle.
- `filesUploaded` (_number_): Number of files that have been fully uploaded so far.
- `totalSize` (_number_): Total size in bytes of all the files in the bundle.
- `sizeUploaded` (_number_): Amount of bytes uploaded so far.

### `webpackOverride`

_optional_

Allows to pass a custom webpack override. See [`bundle()` -> webpackOverride](/docs/bundle#webpackoverride) for more information.

### `enableCaching`

_optional - default true_

Whether webpack caching should be enabled. See [`bundle()` -> enableCaching](/docs/bundle#enablecaching) for more information.

## Return value

An object with the following values:

- `serveUrl` _(string)_: An URL such as `https://remotionlambda-12345.s3.eu-central-1.amazonaws.com/sites/abcdef/index.html`.

  You can use this "Serve URL" to render a video on Remotion Lambda using:

  - The [`npx remotion lambda render`](/docs/lambda/cli/render) and [`npx remotion lambda still`](/docs/lambda/cli/still) commands
  - The [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) and [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda) functions.
  - Locally using the [`renderMedia()`](/docs/renderer/render-media) and [`renderStill()`](/docs/renderer/render-still) functions.
  - Locally using the [`npx remotion render`](/docs/cli) and [`npx remotion still`](/docs/cli) commands

  If you are rendering on Lambda, you can also pass the site name (in this case `abcdef`) as an abbreviation.

- `siteName` _(string)_: The identifier of the site that was given. Is either the site name that you have passed into this function, or a random string that was generated if you didn't pass a site name.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/deploy-site.ts)
- [getSites()](/docs/lambda/getsites)
- [deleteSite()](/docs/lambda/deletesite)
