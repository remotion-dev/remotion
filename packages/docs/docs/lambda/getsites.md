---
image: /generated/articles-docs-lambda-getsites.png
id: getsites
title: getSites()
slug: /lambda/getsites
crumb: "Lambda API"
---

Gets an array of Remotion projects in your S3 account.

The projects are located in the `sites/` subdirectory of your S3 bucket. Remember - you should only have one bucket for Remotion Lambda per region, therefore you do not need to specify the name of the bucket for this function.

## Example

Gets all sites and logs information about them.

```ts twoslash
// @module: ESNext
// @target: ESNext
import { getSites } from "@remotion/lambda/client";

const { sites, buckets } = await getSites({
  region: "eu-central-1",
});

for (const site of sites) {
  console.log(site.id); // A unique ID for referring to that project
  console.log(site.bucketName); // In which bucket the site resides in.
  console.log(site.lastModified); // A unix timestamp, but may also be null
  console.log(site.sizeInBytes); // Size of all contents in the folder
  console.log(site.serveUrl); // URL of the deployed site that you can pass to `renderMediaOnLambda()`
}

for (const bucket of buckets) {
  console.log(bucket.region); // 'eu-central-1'
  console.log(bucket.name); // The name of the S3 bucket.
  console.log(bucket.creationDate); // A unix timestamp of when the site was created.
}
```

:::note
Preferrably import this function from `@remotion/lambda/client` (available from v3.3.42) to avoid problems [inside serverless functions](/docs/lambda/light-client).
:::

## Arguments

An object with the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) which you want to query.

## Return value

A promise resolving to an object with the following properties:

### `sites`

An array of deployed Remotion projects that you can use for rendering.

Each items contains the following properties:

#### `id`

A unique identifier for that project.

#### `bucketName`

The bucket in which the project resides in.

#### `lastModified`

When the files in that project were last changed.

#### `sizeInBytes`

The combined size of all files in that project.

#### `serveUrl`

URL of the deployed site. You can pass it into [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) to render a video or audio.

### `buckets`

An array of all buckets in the selected region in your account that start with `remotionlambda-`.

:::info
You should only have [1 bucket](/docs/lambda/multiple-buckets) per region for all your Remotion projects. Nonetheless `buckets` is an array, since we cannot prevent you from manually creating additional buckets with the `remotionlambda-` prefix.
:::

Each item contains the following properties:

#### `region`

The region the bucket resides in.

#### `name`

The name of the bucket. S3 buckets have globally unique names.

#### `creationDate`

A UNIX timestamp of the point when the bucket was first created.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-sites.ts)
- [deleteSite()](/docs/lambda/deletesite)
