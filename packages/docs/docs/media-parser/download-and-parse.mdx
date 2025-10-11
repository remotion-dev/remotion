---
image: /generated/articles-docs-media-parser-download-and-parse.png
id: download-and-parse
title: Download and Parse Videos or Audio simultaneously
sidebar_label: Download and Parse in Parallel
slug: /media-parser/download-and-parse
crumb: '@remotion/media-parser'
---

:::warning
[We are phasing out Media Parser and are moving to Mediabunny](/blog/mediabunny)!
:::

[`@remotion/media-parser`](/docs/media-parser) allows you to download a remote video to disk, and while the media is downloading, retrieve metadata from it as soon as it is available.

Here is an example using the [`downloadAndParseMedia()`](/docs/media-parser/download-and-parse-media) API:

```tsx twoslash title="Download a file and get metadata"
import {downloadAndParseMedia} from '@remotion/media-parser';
import {nodeWriter} from '@remotion/media-parser/node-writer';

const {durationInSeconds, tracks} = await downloadAndParseMedia({
  src: 'https://s3.amazonaws.com/bucket/uploaded-asset.mp4',
  writer: nodeWriter('output.mp4'),
  fields: {
    durationInSeconds: true,
    tracks: true,
  },
});
// If here was reached, file is downloaded!
console.log(durationInSeconds);
console.log(tracks);
```

You can use callback functions to retrieve information as soon as it is available.  
Throw an error to stop the download.

```tsx twoslash title="Stop the download if the video is too long"
import {downloadAndParseMedia} from '@remotion/media-parser';
import {nodeWriter} from '@remotion/media-parser/node-writer';

await downloadAndParseMedia({
  src: 'https://s3.amazonaws.com/bucket/uploaded-asset.mp4',
  writer: nodeWriter('output.mp4'),
  onDurationInSeconds: (duration) => {
    if (duration && duration > 600) {
      throw new Error('Video is too long');
    }
  },
});
```

If an error occurs (including one you've thrown yourself), you can decide what to do using [`onError`](/docs/media-parser/download-and-parse-media#onerror).

```tsx twoslash title="Continue download despite error"
import {downloadAndParseMedia} from '@remotion/media-parser';
import {nodeWriter} from '@remotion/media-parser/node-writer';

await downloadAndParseMedia({
  src: 'https://s3.amazonaws.com/bucket/uploaded-asset.mp4',
  writer: nodeWriter('output.mp4'),
  onError: (error) => {
    // Force the file to be downloaded despite parsing error.
    // Note: At the end, the error will be thrown nonetheless.
    return {action: 'download'};

    // Default behavior:
    // Abort the download, delete the file and throw the error immediately.
    // return {action: 'fail'};
  },
});
```

## See also

- [`downloadAndParseMedia()`](/docs/media-parser/download-and-parse-media)
