---
id: bundle
title: bundle()
---

_Part of the `@remotion/bundler` package._

Bundles a Remotion project using Webpack and prepares it for rendering using [`renderMedia()`](/docs/renderer/render-media).

```ts
const bundle: (
  entryPoint: string,
  onProgressUpdate?: (progress: number) => void,
  options?: {
    webpackOverride?: WebpackOverrideFn;
    outDir?: string;
    enableCaching?: boolean;
    publicPath?: string;
    rootDir?: string;
    publicDir?: string | null;
  }
) => Promise<string>;
```

## Arguments

### `entryPoint`

A `string` containing an absolute path of the entry point of a Remotion project. In a default Remotion project created with the template, the entry point is located at `src/index.tsx`.

### `onProgressUpdate?`

A callback function that notifies about the progress of the Webpack bundling. Passes a number between `0` and `100`. Example function:

```ts twoslash
const onProgressUpdate = (progress: number) => {
  console.log(`Webpack bundling progress: ${progress}%`);
};
```

### `options`

An object containing the following keys:

#### `webpackOverride?`

_optional_

A function to override the webpack config reducer-style. Takes a function which gives you the current webpack config which you can transform and return a modified version of it. For example:

```ts twoslash
import { WebpackOverrideFn } from "remotion";
// ---cut---
const webpackOverride: WebpackOverrideFn = (webpackConfig) => {
  return {
    ...webpackConfig,
    // Override properties
  };
};
```

#### `outDir?`

_optional_

Specify a desired output directory. If no passed, the webpack bundle will be created in a temp dir.

#### `enableCaching?`

_optional_

A `boolean` specifying whether Webpack caching should be enabled. Default `true`, it is recommended to leave caching enabled at all times since file changes should be recognized by Webpack nonetheless.

#### `publicPath?`

_optional_

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). In some cases like rendering on Lambda, the public path might be a subdirectory.

#### `rootDir?`

_optional, available from v3.1.6_

The directory in which the Remotion project is rooted in. This should be set to the directory that contains the `package.json` which installs Remotion. By default, it is the current working directory.

:::note
The current working directory is the directory from which your program gets executed from. It is not the same as the file where bundle() gets called.
:::

#### `publicDir?`

_Available from v3.2.13_

Set the directory in which the files that can be loaded using [`staticFile()`](/docs/staticfile) are located. By default it is the folder `public/` located in the Remotion root folder.

## Return value

A promise which will resolve into a `string` specifying the output directory.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/bundler/src/bundle.ts)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/renderer/get-compositions)
- [renderMedia()](/docs/renderer/render-media)
- [stitchFramesToVideo()](/docs/renderer/stitch-frames-to-video)
