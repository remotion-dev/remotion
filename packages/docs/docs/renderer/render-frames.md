---
id: render-frames
title: renderFrames()
---

import {AngleChangelog} from '../../components/AngleChangelog';

_Part of the `@remotion/renderer` package._

Renders a series of images using Puppeteer and computes information for mixing audio.

If you want to render only a still image, use [renderStill()](/docs/renderer/render-still).

:::info
In Remotion 3.0, we added the [`renderMedia()`](/docs/renderer/render-media) API which combines `renderFrames()` and `stitchFramesToVideo()` into one simplified step and performs the render faster. Prefer `renderMedia()` if you can.
:::

:::info
Configuration in `remotion.config.ts` and CLI flags do not apply to this function. You must pass all options explicitly.
:::

## Arguments

Takes an object with the following keys:

### `composition`

A video config, consisting out of `id`, `width`, `height`, `durationInFrames` and `fps`, where `id` is the composition ID. You can obtain an array of available compositions using [`getCompositions()`](/docs/renderer/get-compositions).

### `onStart`

A callback that fires after the setup process (validation, browser launch) has finished. Example value

```ts twoslash
const onStart = () => {
  console.log("Starting rendering...");
};
```

### `onFrameUpdate`

A callback function that gets called whenever a frame finished rendering. An argument is passed containing how many frames have been rendered (not the frame number of the rendered frame). Example value

```ts twoslash
const onFrameUpdate = (frame: number) => {
  console.log(`${frame} frames rendered.`);
};
```

### `outputDir`

A `string` specifying the directory (absolute path) to which frames should be saved. Pass `null` to this option and use the `onFrameBuffer` callback instead to get a `Buffer` of the frame rather than to write it to any location.

### `inputProps`

[Custom props which will be passed to the component.](/docs/parametrized-rendering) Useful for rendering videos with dynamic content. Can be an object of any shape.

### `serveUrl`

Either a Webpack bundle or a URL pointing to a bundled Remotion project. Call [`bundle()`](/docs/bundle) to generate a bundle. You can either pass the file location or deploy it as a website and pass the URL.

### `imageFormat`

A `string` which must be either `png`, `jpeg` or `none`.

- Choose `jpeg` by default because it is the fastest.
- Choose `png` if you want your image sequence to have an alpha channel (for transparency).
- Choose `none` if you only want to render audio.

### `parallelism?`

_optional_

A `number` specifying how many frames should be rendered in parallel or `null` to let Remotion decide based on the CPU of the host machine. Default is half of the CPU threads available.

### `scale?`

_number - default: 1 - available from v2.6.7_

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `quality?`

_optional_

Sets the quality of the generated JPEG images. Must be an integer between 0 and 100. Default is to leave it up to the browser, [current default is 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

Only applies if `imageFormat` is `'jpeg'`, otherwise this option is invalid.

### `frameRange?`

_optional_

Specify a single frame (passing a `number`) or a range of frames (passing a tuple `[number, number]`) to be rendered. By passing `null` (default) all frames of a composition get rendered.

### `muted`

_optional, available since v3.2.1_

Disables audio output. This option may only be set in combination with a video codec and should also be passed to [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video).

### `dumpBrowserLogs?`

_optional_

Passes the `dumpio` flag to Puppeteer which will log all browser logs to the console. Useful for debugging. `boolean` flag, default is `false`.

### `puppeteerInstance?`

_optional_

An already open Puppeteer [`Browser`](https://pptr.dev/#?product=Puppeteer&version=main&show=api-class-browser) instance. Use [`openBrowser()`](/docs/renderer/open-browser) to create a new instance. Reusing a browser across multiple function calls can speed up the rendering process. You are responsible for opening and closing the browser yourself. If you don't specify this option, a new browser will be opened and closed at the end.

### `envVariables?`

_optional - Available since v2.2.0_

An object containing key-value pairs of environment variables which will be injected into your Remotion projected and which can be accessed by reading the global `process.env` object.

### `onBrowserLog?`

_optional - Available since v3.0.0_

Gets called when your project calls `console.log` or another method from console. A browser log has three properties:

- `text`: The message being printed
- `stackTrace`: An array of objects containing the following properties:
  - `url`: URL of the resource that logged.
  - `lineNumber`: 0-based line number in the file where the log got called.
  - `columnNumber`: 0-based column number in the file where the log got called.
- `type`: The console method - one of `log`, `debug`, `info`, `error`, `warning`, `dir`, `dirxml`, `table`, `trace`, `clear`, `startGroup`, `startGroupCollapsed`, `endGroup`, `assert`, `profile`, `profileEnd`, `count`, `timeEnd`, `verbose`

```tsx twoslash
interface ConsoleMessageLocation {
  /**
   * URL of the resource if known or `undefined` otherwise.
   */
  url?: string;
  /**
   * 0-based line number in the resource if known or `undefined` otherwise.
   */
  lineNumber?: number;
  /**
   * 0-based column number in the resource if known or `undefined` otherwise.
   */
  columnNumber?: number;
}

type BrowserLog = {
  text: string;
  stackTrace: ConsoleMessageLocation[];
  type:
    | "log"
    | "debug"
    | "info"
    | "error"
    | "warning"
    | "dir"
    | "dirxml"
    | "table"
    | "trace"
    | "clear"
    | "startGroup"
    | "startGroupCollapsed"
    | "endGroup"
    | "assert"
    | "profile"
    | "profileEnd"
    | "count"
    | "timeEnd"
    | "verbose";
};

const renderFrames = (options: {
  onBrowserLog?: (log: BrowserLog) => void;
}) => {};
// ---cut---
renderFrames({
  onBrowserLog: (info) => {
    console.log(`${info.type}: ${info.text}`);
    console.log(
      info.stackTrace
        .map((stack) => {
          return `  ${stack.url}:${stack.lineNumber}:${stack.columnNumber}`;
        })
        .join("\n")
    );
  },
});
```

### `ffmpegExecutable?`

_optional, available from v3.0.11_

An absolute path overriding the `ffmpeg` executable to use.

### `ffprobeExecutable?`

_optional, available from v3.0.17_

An absolute path overriding the `ffprobe` executable to use.

### `browserExecutable?`

_optional, available from v3.0.11_

A string defining the absolute path on disk of the browser executable that should be used. By default Remotion will try to detect it automatically and download one if none is available. If `puppeteerInstance` is defined, it will take precedence over `browserExecutable`.

### `cancelSignal?`

_optional, available from v3.0.15_

A token that allows the render to be cancelled. See: [`makeCancelSignal()`](/docs/renderer/make-cancel-signal)

### `onFrameBuffer?`

_optional, available from 3.0_

If you passed `null` to `outputDir`, this method will be called passing a buffer of the current frame. This is mostly used internally by Remotion to implement [`renderMedia()`](/docs/renderer/render-media) and might have limited usefulness for end users.

### `timeoutInMilliseconds?`

_optional, available from v2.6.3_

A number describing how long one frame may take to resolve all `delayRender()` calls before the render times out and fails. Default: `30000`

### `everyNthFrame`

_optional, available from v3.1_

Renders only every nth frame. For example only every second frame, every third frame and so on. Only meant for rendering GIFs. [See here for more details.](/docs/render-as-gif)

### `chromiumOptions?`

_optional, available from v2.6.5_

Allows you to set certain Chromium / Google Chrome flags. See: [Chromium flags](/docs/chromium-flags).

:::note
Chromium flags need to be set at browser launch. If you pass an instance using [`puppeteerInstance`](#puppeteerinstance), options passed to `renderFrames()` will not apply, but rather the flags that have been passed to [`openBrowser()`](/docs/renderer/open-browser).
:::

#### `disableWebSecurity`

_boolean - default `false`_

This will most notably disable CORS among other security features.

#### `ignoreCertificateErrors`

_boolean - default `false`_

Results in invalid SSL certificates, such as self-signed ones, being ignored.

#### `headless`

_boolean - default `true`_

If disabled, the render will open an actual Chrome window where you can see the render happen.

#### `gl`

_string_

<AngleChangelog />

Select the OpenGL renderer backend for Chromium.
Accepted values:

- `"angle"`,
- `"egl"`,
- `"swiftshader"`
- `"swangle"`
- `null` - Chromiums default

**Default for local rendering**: `null`.  
**Default for Lambda rendering**: `"swangle"`.

## Return value

A promise resolving to an object containing the following properties:

- `frameCount`: `number` - describing how many frames got rendered.
- `assetsInfo`: `RenderAssetInfo` - information that can be passed to `stitchFramesToVideo()` to mix audio. The shape of this object should be considered as Remotion internals and may change across Remotion versions.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/render-frames.ts)
- [renderMedia()](/docs/renderer/render-media)
- [bundle()](/docs/bundle)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/renderer/get-compositions)
- [stitchFramesToVideo()](/docs/renderer/stitch-frames-to-video)
- [renderStill()](/docs/renderer/render-still)
