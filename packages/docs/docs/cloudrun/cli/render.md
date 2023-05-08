---
image: /generated/articles-docs-cloudrun-cli-render.png
id: render
sidebar_label: render
title: "npx remotion cloudrun render"
slug: /cloudrun/cli/render
crumb: "Cloud Run CLI Reference"
---

Using the `npx remotion cloudrun render` command, you can render a video or image on GCP.

The structure of a command is as follows:

```
npx remotion cloudrun render <media | still> <serve-url> [<composition-id>] [<output-location>]
```

- The serve URL is obtained by deploying a Remotion project to a GCP Storage Bucket using the [`sites create`](/docs/cloudrun/cli/sites#create) command or calling [`deploySite()`](/docs/cloudrun/deploysite).
- The [composition ID](/docs/terminology#composition-id). If not specified, the list of compositions will be fetched and you can choose a composition.
- The `output-location` parameter is optional. If you don't specify it, the video is stored in your Cloud Storage bucket. If you specify a location, it gets downloaded to your device in an additional step.

## Example commands

Rendering a video, passing the service name:

```
npx remotion cloudrun render media https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh/index.html tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Rendering a still, passing the service name:

```
npx remotion cloudrun render still https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh/index.html tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Using the site name as opposed to the full serve-url:

```
npx remotion cloudrun render media test-site tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Passing in input props:

```
npx remotion cloudrun render media test-site tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800 --props='{"hi": "there"}'
```

## Flags

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to select. Both the Service and the Cloud Storage bucket should be in this region.

### `--props`

[React Props to pass to the root component of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

### `--privacy`

One of:

- `"public"` (_default_): The rendered media is publicly accessible under the Cloud Storage URL.
- `"private"`: The rendered media is not publicly available, but is available within the GCP project to those with the correct permissions.

### `--jpeg-quality`

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### `--image-format`

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setvideoimageformat) The default image format is `jpeg`.

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `--env-file`

Specify a location for a dotenv file. Default `.env`.

### `--frames`

[Render a subset of a video](/docs/config#setframerange). Example: `--frames=0-9` to select the first 10 frames. To render a still, use the [`still`](/docs/cloudrun/cli/still) command.

### `--out-name`

The file name of the media output as stored in the Cloud Storage bucket. By default, it is `out` plus the appropriate file extension, for example: `out.mp4`. Must match `/([0-9a-zA-Z-!_.*'()/]+)/g`.

### `--service-name`

Specify the name of the service which should be used to perform the render.

## Media Rendering Specific Flags

### `--codec`

[`h264` or `h265` or `png` or `vp8` or `mp3` or `aac` or `wav` or `prores`](/docs/config#setcodec). If you don't supply `--codec`, it will use `h264`.

### `--audio-codec`

[Set which codec the audio should have.](/docs/config#setaudiocodec) For defaults and possible values, refer to the [Encoding guide](/docs/encoding/#audio-codec).

### `--audio-bitrate`

Specify the target bitrate for the generated audio.  
The syntax for FFMPEGs `-b:a` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact audio bitrate specified.
Example values: `128K` for 128 kbps, `1M` for 1 Mbps.  
Default: `320k`

### `--video-bitrate`

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

### `--every-nth-frame`

[Render only every nth frame.](/docs/config#seteverynthframe) This option may only be set when rendering GIFs. This allows you to lower the FPS of the GIF.

For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](/docs/render-as-gif)

### `--number-of-gif-loops`

[Set the looping behavior.](/docs/config#setnumberofgifloops) This option may only be set when rendering GIFs. [See here for more details.](/docs/render-as-gif#changing-the-number-of-loops)
