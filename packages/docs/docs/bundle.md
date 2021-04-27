---
id: bundle
title: bundle()
---

_Part of the `@remotion/bundler` package._

Bundles a Remotion project using Webpack and prepares it for render using [`renderFrames()`](/docs/render-frames).

```ts
const bundle: (
  entryPoint: string,
  onProgressUpdate?: (progress: number) => void,
  options?: {
    webpackOverride?: WebpackOverrideFn;
    outDir?: string;
    enableCaching?: boolean;
  }
) => Promise<string>
```

## Arguments

### `entryPoint`

A `string` containing an absolute path of the entry point of a Remotion project. In a default Remotion project created with the template, the entry point is located at `src/index.tsx`.

### `onProgressUpdate?`

A callback function that notifies about the progress of the Webpack bundling. Example function:

```ts
const onProgressUpdate = (progress: number) => {
  console.log(`Webpack bundling progress: ${progress * 100}%`)
}
```

### `options`

An object containing the following keys:

#### `webpackOverride?`

_optional_

A function to override the webpack config reducer-style. Takes a function which gives you the current webpack config which you can transform and return a modified version of it. For example:

```ts
const webpackOverride: WebpackOverrideFn = (webpackConfig) => {
  return {
    ...webpackConfig
    // Override properties
  }
}
```

#### `outDir?`

_optional_

Specify a desired output directory. If no passed, the webpack bundle will be created in a temp dir.

#### `enableCaching?`

_optional_

A `boolean` specifying whether Webpack caching should be enabled. Default `true`, it is recommended to leave caching enabled at all times since file changes should be recognized by Webpack nonetheless.

## Return value

A promise which will resolve into a `string` specifying the output directory.

## See also

- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/get-compositions)
- [renderFrames()](/docs/render-frames)
- [stitchFramesToVideo()](/docs/stitch-frames-to-video)
