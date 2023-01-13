---
image: /generated/articles-docs-shapes-square.png
title: <Square />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

## Arguments

### `options`

An object with the following arguments:

- `audioData`: `AudioData` - information about the audio. Use [`getAudioData()`](/docs/get-audio-data) to fetch it.
- `startTimeInSeconds`: `number` - trim the waveform to exclude all data before `startTimeInSeconds`.
- `durationInSeconds`: `number` - trim the waveform to exclude all data after `startTimeInSeconds + durationInSeconds`.
- `numberOfSamples`: `number` - how big you want the result array to be. The function will compress the waveform to fit in `numberOfSamples` data points.



## See also
- [makeTriangle()](/docs/paths/make-triangle)
- [makeSquare()](/docs/paths/make-square)
- [`@remotion/shapes`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/make-triangle.tsx)
