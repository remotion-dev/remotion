---
name: remotion-render
description: Export a Remotion video
version: 4.0.542
---

## General rendering strategy

Use Remotion's bundled browser for rendering, including compositions using
`<HtmlInCanvas>`. It includes the required browser APIs and Remotion's browser
fixes. Let Remotion download or update it as needed. Do not reuse a recording
browser or set `--browser-executable`, `browserExecutable`, or `chromeMode`
unless the user explicitly requests a different browser.

Render a video using:

```
npx remotion render
```

Full list of options: https://www.remotion.dev/docs/cli/render.md

## Passing input props

Pass input props as inline JSON or as a path to a JSON file:

```
npx remotion render [composition-id] out/video.mp4 --props='{"title": "Hello"}'
npx remotion render [composition-id] out/video.mp4 --props=./props.json
```

Input props are shallow-merged over the `defaultProps` of the composition.
See https://www.remotion.dev/docs/passing-props.md.

## License key

Companies that need a [Remotion license](../remotion-license/SKILL.md) should
pass their license key to every render. If the user qualifies for the free
license, pass `free-license` instead:

```
npx remotion render [composition-id] out/video.mp4 --license-key=$REMOTION_PRIVATE_LICENSE_KEY
```

Only pass `--license-key` if a key is available, since an empty value is not a valid key.
Add `--is-production=false` for test renders so that they are not billed.
See https://www.remotion.dev/docs/telemetry.md.

Render a still using:

```
npx remotion still
```

Full list of options: https://www.remotion.dev/docs/cli/still.md

To render several frames as images in one call, use `render --frames`:

```
npx remotion render [composition-id] out/frames --frames=0,30,90 --image-format=png
```

See https://www.remotion.dev/docs/cli/render.md#--frames for more options.

The frames are written as `element-[frame].[ext]`. The frame number is padded
with zeros to the number of digits of the highest rendered frame, so
`--frames=4,30` writes `element-04.png` and `element-30.png`. List the output
folder instead of guessing the filenames, or pass `--image-sequence-pattern`
to change the pattern.

## Transparent videos

See [Transparent videos](./transparent-videos.md) for rendering out a video with transparency.
