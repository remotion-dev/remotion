---
image: /generated/articles-docs-paths-make-triangle.png
title: makeTriangle()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._


Generates Triangle SVG path

## Arguments

### `options`

An object with the following arguments:

- `audioData`: `AudioData` - information about the audio. Use [`getAudioData()`](/docs/get-audio-data) to fetch it.
- `startTimeInSeconds`: `number` - trim the waveform to exclude all data before `startTimeInSeconds`.
- `durationInSeconds`: `number` - trim the waveform to exclude all data after `startTimeInSeconds + durationInSeconds`.
- `numberOfSamples`: `number` - how big you want the result array to be. The function will compress the waveform to fit in `numberOfSamples` data points.



## Credits

Source code stems mostly from [triangle](https://stackblitz.com/edit/react-triangle-svg?file=index.js).

## See also

- [makeCircle()](/docs/paths/make-circle)
- [makeSquare()](/docs/paths/make-square)
- [`@remotion/shapes`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/make-triangle.tsx)
