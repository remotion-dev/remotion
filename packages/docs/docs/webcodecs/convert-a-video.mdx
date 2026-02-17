---
image: /generated/articles-docs-webcodecs-convert-a-video.png
id: convert-a-video
title: Convert a video
slug: /webcodecs/convert-a-video
crumb: '@remotion/webcodecs'
---

:::warning
[We are phasing out Remotion WebCodecs and are moving to Mediabunny](/blog/mediabunny)!
:::

You can convert a video in the browser from one format to another using the [`convertMedia()`](/docs/webcodecs/convert-media) function from [`@remotion/webcodecs`](/docs/webcodecs).

import {LicenseDisclaimer} from './LicenseDisclaimer';
import {UnstableDisclaimer} from './UnstableDisclaimer';

<details>
  <summary>💼 Important License Disclaimer</summary>
  <LicenseDisclaimer />
</details>

The following input formats are supported:

- ISO Base Media (`.mp4`, `.mov`, `.m4a`)
- Matroska (`.mkv`, `.webm`)
- `.avi`
- MPEG Transport Stream (`.ts`)
- `.wav`,
- `.mp3`
- `.flac`
- `.aac`
- HLS (`.m3u8`)

The following output formats are supported:

- MP4
- WebM
- WAV

The following output video codecs are supported:

- VP8 (WebM only)
- VP9 (WebM only)
- H.264 (MP4 only)

The following output audio codecs are supported:

- Opus (WebM only)
- AAC (MP4 only)
- PCM (WAV only)

## Installation

Install the `@remotion/webcodecs` and `@remotion/media-parser` packages:

<Installation pkg="@remotion/webcodecs @remotion/media-parser" />
<br />
<details>
  <summary>🚧 Unstable API</summary>
  <UnstableDisclaimer />
</details>

## Basic conversions

### Converting from an URL

(needs to be CORS-enabled)

```tsx twoslash title="Converting an MP4 to a WebM"
import {convertMedia} from '@remotion/webcodecs';

const result = await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
});

const blob = await result.save();
```

### Converting from a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File):

```tsx twoslash title="Converting a file"
import {convertMedia} from '@remotion/webcodecs';

// Get an actual file from an <input type="file"> element
const file = new File([], 'video.mp4');

const result = await convertMedia({
  src: file,
  container: 'webm',
});

const blob = await result.save();
```

## Specifying the output codec

You can specify the output codec by passing the [`videoCodec`](/docs/webcodecs/convert-media#videocodec) and [`audioCodec`](/docs/webcodecs/convert-media#audiocodec) options:

```tsx twoslash title="Converting to VP9"
import {convertMedia} from '@remotion/webcodecs';

const result = await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
  videoCodec: 'vp9',
  audioCodec: 'opus',
});

const blob = await result.save();
```

## Saving the converted video

The `convertMedia()` function returns a result object with a `save()` method that you need to call to get the converted video as a `Blob`.

### Download the converted video

```tsx twoslash title="Download converted video"
import {convertMedia} from '@remotion/webcodecs';

const result = await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
});

const blob = await result.save();

// Create download link
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'converted-video.webm';
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
```

### Upload the converted video

```tsx twoslash title="Upload converted video"
import {convertMedia} from '@remotion/webcodecs';

const result = await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
});

const blob = await result.save();

// Upload to server
const formData = new FormData();
formData.append('video', blob, 'converted-video.webm');

await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

### Display the converted video

```tsx twoslash title="Display converted video"
import {convertMedia} from '@remotion/webcodecs';

const result = await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
});

const blob = await result.save();

// Display in video element
const url = URL.createObjectURL(blob);
const video = document.createElement('video');
video.src = url;
video.controls = true;
document.body.appendChild(video);

// Don't forget to clean up when done
// URL.revokeObjectURL(url);
```

## Advanced conversions

See [Track Transformation](/docs/webcodecs/track-transformation) for how you can get more control over the conversion.

## See also

- [`convertMedia()`](/docs/webcodecs/convert-media)
- [Rotate a video](/docs/webcodecs/rotate-a-video)
