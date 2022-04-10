---
id: 3-0-migration
sidebar_title: v3.0 Migration
title: v3.0 Breaking changes
---

When upgrading from Remotion 2 to Remotion 3, note the following changes and apply them to your project.

## `renderFrames` doesn't take `compositionId` parameter anymore

Instead, the composition ID is now embedded in the `config` object.

**Upgrade path:** Remove the `compositionId` property from `renderFrames()`. Add the `composition.id` property to `renderFrames()` or pull the object from `getCompositions()`.

## Errors thrown in your app make the render fail

Previously, you could catch errors being thrown in your Remotion code using the `onError` property of `getCompositions()`, `renderFrames()` and `renderStill()`.

The new behavior of Remotion 3.0 is that if an error occurs, these functions reject instead.

**Upgrade path**: Remove the `onError` property from your `getCompositions()`, `renderFrames()` and `renderStill()` calls and catch errors in a try / catch instead. Eliminate any error being thrown in your application.

## Removed `parallelism` flag for `stitchFramesToVideo` API

This parameter did probably not to what you thought it would. To avoid any confusion, we removed it without any replacement.

**Upgrade path**: If you added the `parallelism` property to the `stitchFramesToVideo()`, remove it.

## Removed `imageFormat` parameter from `stitchFramesToVideo` API

The necessary information is now embedded in `assetsInfo`, in the return value of `renderFrames()`. The parameter `imageFormat` is not necessary anymore to pass into `stitchFramesToVideo()`.

**Upgrade path**: Remove the `imageFormat` option from `stitchFramesToVideo()`.

## `useVideoConfig` returns `id` and `defaultProps`

The [`useVideoConfig()`](/docs/use-video-config) hook now returns two additional properties:

```diff
{
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "durationInFrames": 30
+ "id": "my-comp",
+ "defaultProps": {}
}
```

**Upgrade path**: Ensure you don't rely on the new properties not being there.

## Removed `webpackBundle` from `stitchFramesToVideo` API

TODO

## Moved `imageFormat` in `stitchFramesToVideo` API

TODO

## Renamed `browserInstance` to `puppeteerInstance` in `getCompositions()`

TODO

## Renamed `config` in `renderFrames()` to `composition`

TODO

## React 18 types

TODO

## Deprecated `overrideWebpackConfig()` is removed

```ts title="remotion.config.ts"
import { overrideWebpackConfig } from "@remotion/bundler";
```

in the config file is deprecated.

Use

```ts
import { Config } from "remotion";

Config.Bundling.overrideWebpackConfig();
```

instead.

## Node 14 is required
