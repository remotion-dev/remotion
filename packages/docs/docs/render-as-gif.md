---
image: /generated/articles-docs-render-as-gif.png
id: render-as-gif
title: Rendering GIFs
crumb: "Techniques"
---

_Available since v3.1_

You can render a video as a GIF by:

- passing `--codec=gif` in the command line
- setting `codec: "gif"` in [`renderMedia()`](/docs/renderer/render-media), [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video) or [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda).

## Reducing frame rate

Commonly a GIF has a lower frame rate than a video. For this, we support a parameter `everyNthFrame` that works as follows:

- By default, `everyNthFrame` is set to `1`: Frames `0`, `1`, `2`, `3`, `4` and so on are rendered.
- Assuming `everyNthFrame` is `2`, only every 2nd frame is rendered: `1`, `3`, `5`, `7` and so on. A 30FPS video would now become a 15FPS GIF.
- If `everyNthFrame` is `3`, only every 3rd frame is rendered: `2`, `5`, `8`, `11` and the pattern continues.

`everyNthFrame` is supported:

- in [`renderFrames()`](/docs/renderer/render-frames#everynthframe), [`renderMedia()`](/docs/renderer/render-media#everynthframe) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#everynthframe)
- in the CLI using `--every-nth-frame=2` [locally](/docs/cli/render#--every-nth-frame) or [on Lambda](/docs/lambda/cli/render#--every-nth-frame).
- in the config file using [`setEveryNthFrame()`](/docs/config#seteverynthframe).

## Changing the number of loops

<!-- Changing the title will change other links -->

The `numberOfGifLoops` option allows you to set the number of loops as follows:

- `null` (or omitting in the CLI) means to play the GIF indefinitely.
- `0` disables looping.
- `1` loops the GIF once (plays twice in total)
- `2` loops the GIF twice (plays three times in total)
- and so on.

The `numberOfGifLoops` option can be set:

- In the CLI using the `--number-of-gif-loops=0` flag when rendering [locally](/docs/cli/render#--number-of-gif-loops) or on [Lambda](/docs/lambda/cli/render#--number-of-gif-loops).
- in [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video#numberofgifloops), [`renderMedia()`](/docs/renderer/render-media#numberofgifloops) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#numberofgifloops)
- in the config file using [`setNumberOfGifLoops()`](/docs/config#setnumberofgifloops).

## Importing GIFs

Wondering how to import other GIFs into a Remotion project? [See here.](/docs/gif)

## Transparent GIFs

To render a transparent GIF, the [`imageFormat`](/docs/renderer/render-media) option must be set to `"png"`. In the Remotion Studio, this can be set in the "Picture" tab.

## See also

- [Encoding guide](/docs/encoding)
