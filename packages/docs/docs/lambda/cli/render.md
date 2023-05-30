---
image: /generated/articles-docs-lambda-cli-render.png
id: render
sidebar_label: render
title: "npx remotion lambda render"
slug: /lambda/cli/render
crumb: "Lambda CLI Reference"
---

import { MinimumFramesPerLambda } from "../../../components/lambda/default-frames-per-lambda";

Using the `npx remotion lambda render` command, you can render a video in the cloud.

The structure of a command is as follows:

```
npx remotion lambda render <serve-url> [<composition-id>] [<output-location>]
```

- The serve URL is obtained by deploying a Remotion project to an AWS S3 bucket using the [`sites create`](/docs/lambda/cli/sites#create) command or calling [`deploySite()`](/docs/lambda/deploysite).
- The [composition ID](/docs/terminology#composition-id). If not specified, the list of compositions will be fetched and you can choose a composition.
- The `output-location` parameter is optional. If you don't specify it, the video is stored in your S3 bucket. If you specify a location, it gets downloaded to your device in an additional step.

## Example commands

Rendering a video:

```
npx remotion lambda render https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testbed/index.html my-comp
```

Rendering a video and saving it to `out/video.mp4`:

```
npx remotion lambda render https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testbed/index.html my-comp out/video.mp4
```

Using the shorthand serve URL:

```
npx remotion lambda render testbed my-comp
```

Passing in input props:

```
npx remotion lambda render --props='{"hi": "there"}' testbed my-comp
```

Printing debug information including a CloudWatch link:

```
npx remotion lambda render --log=verbose testbed my-comp
```

Keeping the output video private:

```
npx remotion lambda render --privacy=private testbed my-comp
```

Rendering only the audio:

```
npx remotion lambda render --codec=mp3 testbed my-comp
```

## Flags

### `--region`

The [AWS region](/docs/lambda/region-selection) to select. Both project and function should be in this region.

### `--props`

[React Props to pass to the root component of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

### `--log`

Log level to be used inside the Lambda function. Also, if you set it to `verbose`, a link to CloudWatch will be printed where you can inspect logs.

### `--privacy`

One of:

- `"public"` (_default_): The rendered media is publicly accessible under the S3 URL.
- `"private"`: The rendered media is not publicly available, but signed links can be created using [presignUrl()](/docs/lambda/presignurl).
- `"no-acl"` (_available from v.3.1.7_): The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](#outname).

### `--max-retries`

How many times a single chunk is being retried if it fails to render. Default `1`.

### `--frames-per-lambda`

How many frames should be rendered in a single Lambda function. Increase it to require less Lambda functions to render the video, decrease it to make the render faster.

Default value: [Dependant on video length](/docs/lambda/concurrency)  
Minimum value: <MinimumFramesPerLambda />

:::note
The `framesPerLambda` parameter cannot result in more than 200 functions being spawned. See: [Concurrency](/docs/lambda/concurrency)
:::

### `--concurrency-per-lambda`<AvailableFrom v="3.0.30" />

By default, each Lambda function renders with concurrency 1 (one open browser tab). You may use the option to customize this value.

### `--jpeg-quality`

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### ~~`--quality`~~

Renamed to `jpegQuality` in `v4.0.0`.

### `--muted`<AvailableFrom v="3.2.1" />

[Disables audio output.](/docs/config#setmuted) This option may only be used when rendering a video.

### `--codec`

[`h264` or `h265` or `png` or `vp8` or `mp3` or `aac` or `wav` or `prores`](/docs/config#setcodec). If you don't supply `--codec`, it will use `h264`.

### `--audio-codec`<AvailableFrom v="3.3.42" />

[Set which codec the audio should have.](/docs/config#setaudiocodec) For defaults and possible values, refer to the [Encoding guide](/docs/encoding/#audio-codec).

### `--audio-bitrate`<AvailableFrom v="3.2.32" />

Specify the target bitrate for the generated audio.  
The syntax for FFMPEGs `-b:a` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact audio bitrate specified.
Example values: `128K` for 128 kbps, `1M` for 1 Mbps.  
Default: `320k`

### `--video-bitrate`<AvailableFrom v="3.2.32" />

Specify the target bitrate for the generated video.  
The syntax for FFMPEGs `-b:v` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact video bitrate specified.  
This option cannot be set if `--crf` is set.
Example values: `512K` for 512 kbps, `1M` for 1 Mbps.

### `--prores-profile`

[Set the ProRes profile](/docs/config#setproresprofile). This option is only valid if the [`codec`](#--codec) has been set to `prores`. Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`. See [here](https://video.stackexchange.com/a/14715) for explanation of possible values. Default: `hq`.

### `--crf`

[To set Constant Rate Factor (CRF) of the output](/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size.

### `--pixel-format`

[Set a custom pixel format. See here for available values.](/docs/config#setpixelformat)

### `--image-format`

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setvideoimageformat) The default image format is `jpeg`.

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `--env-file`

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](/docs/env-variables)

### `--frames`

[Render a subset of a video](/docs/config#setframerange). Example: `--frames=0-9` to select the first 10 frames. To render a still, use the [`still`](/docs/lambda/cli/still) command.

### `--every-nth-frame`<AvailableFrom v="3.1.0" />

[Render only every nth frame.](/docs/config#seteverynthframe) This option may only be set when rendering GIFs. This allows you to lower the FPS of the GIF.

For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](/docs/render-as-gif)

### `--number-of-gif-loops`<AvailableFrom v="3.1.0" />

[Set the looping behavior.](/docs/config#setnumberofgifloops) This option may only be set when rendering GIFs. [See here for more details.](/docs/render-as-gif#changing-the-number-of-loops)

### `--out-name`

The file name of the media output as stored in the S3 bucket. By default, it is `out` plus the appropriate file extension, for example: `out.mp4`. Must match `/([0-9a-zA-Z-!_.*'()/]+)/g`.

### `--overwrite`<AvailableFrom v="3.2.25" />

If a custom out name is specified and a file already exists at this key in the S3 bucket, decide whether that file will be deleted before the render begins. Default `false`.

An existing file at the output S3 key will conflict with the render and must be deleted beforehand. If this setting is `false` and a conflict occurs, an error will be thrown.

### `--webhook`<AvailableFrom v="3.2.30" />

Sets a webhook to be called when the render finishes or fails. [`renderMediaOnLambda() -> webhook.url`](/docs/lambda/rendermediaonlambda#webhook). To be used together with `--webhook-secret`.

### `--webhook-secret`<AvailableFrom v="3.2.30" />

Sets a webhook secret for the webhook (see above). [`renderMediaOnLambda() -> webhook.secret`](/docs/lambda/rendermediaonlambda#webhook). To be used together with `--webhook`.

### `--height`<AvailableFrom v="3.2.40" />

[Overrides composition height.](/docs/config#overrideheight)

### `--width`<AvailableFrom v="3.2.40" />

[Overrides composition width.](/docs/config#overridewidth)

### `--function-name`<AvailableFrom v="3.3.38" />

Specify the name of the function which should be used to invoke and orchestrate the render. You only need to pass it if there are multiple functions with different configurations.

### `--renderer-function-name`<AvailableFrom v="3.3.38" />

If specified, this function will be used for rendering the individual chunks. This is useful if you want to use a function with higher or lower power for rendering the chunks than the main orchestration function.

If you want to use this option, the function must be in the same region, the same account and have the same version as the main function.

### `--force-bucket-name`<AvailableFrom v="3.3.42" />

Specify a specific bucket name to be used. [This is not recommended](/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security`

This will most notably disable CORS in Chrome among other security features.

### `--user-agent`<AvailableFrom v="3.3.83"/>

Lets you set a custom user agent that the headless Chrome browser assumes.
