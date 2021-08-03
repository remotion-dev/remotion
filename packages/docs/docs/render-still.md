---
id: render-still
title: renderStill()
---

_Part of the `@remotion/renderer` package. Available from v2.3._

Renders a single frame to an image.

If you want to render the full image sequence, use [renderFrames()](/docs/render-frames) instead.

## Example usage

You first need to bundle the project and fetch the compositions. Read [the code snippet on the site for server-side rendering](/docs/ssr/#render-a-video-programmatically) for an example how to come up with the `bundled` and `composition` variables.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {bundle} from '@remotion/bundler';
import {
  getCompositions,
  renderStill
} from '@remotion/renderer';

// The composition you want to render
const compositionId = 'HelloWorld'

const bundled = await bundle(require.resolve('./src/index'))

const comps = await getCompositions(bundled, {
  inputProps: {
    custom: 'data',
  },
})
const composition = comps.find((c) => c.id === compositionId)

if (!composition) {
  throw new Error(`No composition with the ID ${compositionId} found`)
}

// ---cut---

await renderStill({
  composition,
  webpackBundle: bundled,
  output: '/tmp/still.png',
  inputProps: {
    custom: 'data'
  }
})
```

## Arguments

Takes an object with the following properties:

### `composition`

A video composition object, consisting of `id`, `height`, `width`, `durationInFrames` and `fps`. Use [`getCompositions()`](/docs/get-compositions) to get a list of available video configs.

### `webpackBundle`

The absolute location of your webpack bundle. Use [`bundle()`](/docs/bundle) to bundle your project programmatically.

### `output`

An absolute path to where the frame should be rendered to.

### `inputProps?`

[Custom props which will be passed to the component.](/docs/parametrized-rendering) Useful for rendering videos with dynamic content. Can be an object of any shape.

### `frame?`

_optional - default: 0_

Which frame should be rendered based on it's number.

### `imageFormat?`

_optional - default: "png"_

Which output format the image should have, either `png` or `jpeg`.

### `quality?`

_optional - default: 80_

Sets the JPEG quality - must be an integer between 0 and 100 and can only be passed if `imageFormat` is set to `jpeg`.

### `puppeteerInstance?`

_optional - default `null`_

An already open Puppeteer [`Browser`](https://pptr.dev/#?product=Puppeteer&version=main&show=api-class-browser) instance. Reusing a browser across multiple function calls can speed up the rendering process. You are responsible for opening and closing the browser yourself. If you don't specify this option, a new browser will be opened and closed at the end.

### `envVariables?`

_optional - default `{}`_

An object containing key-value pairs of environment variables which will be injected into your Remotion projected and which can be accessed by reading the global `process.env` object.

### `dumpBrowserLogs?`

_optional - default `false`_

A boolean value deciding whether Puppeteer logs should be printed to the console.

### `onError?`

_optional_

Allows you to react to an exception thrown in your React code. The callback has an argument which is the error.

```tsx twoslash
import {renderStill as rs} from '@remotion/renderer'
const renderStill = (options: Partial<Parameters<typeof rs>[0]>) => {}
// ---cut---
renderStill({
  // ... other arguments
  onError: (err: Error) => {
    // Handle error here
  }
})
```

## Return value

A promise with no value. If the render succeeded, the still has been saved to `output`. If the render failed, the promise rejects.

- [bundle()](/docs/bundle)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/get-compositions)
- [renderFrames()](/docs/render-frames)
