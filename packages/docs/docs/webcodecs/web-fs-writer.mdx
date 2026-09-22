---
image: /generated/articles-docs-webcodecs-web-fs-writer.png
id: web-fs-writer
title: webFsWriter
slug: /webcodecs/web-fs-writer
crumb: '@remotion/webcodecs'
---

:::warning
[We are phasing out Remotion WebCodecs and are moving to Mediabunny](/blog/mediabunny)!
:::

import {LicenseDisclaimer} from './LicenseDisclaimer';
import {UnstableDisclaimer} from './UnstableDisclaimer';

<details>
  <summary>💼 Important License Disclaimer</summary>
  <LicenseDisclaimer />
</details>

:::warning
**Unstable API**: The writer interface is experimental. The API may change in the future.
:::

A writer for `@remotion/webcodecs` that writes to the browser's file system using the File System Access API.

Can be used for [`convertMedia()`](/docs/webcodecs/convert-media) to write the converted output directly to a temporary file in the browser's origin-private file system.

## Availability

This writer is only available in browsers that support the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API). Use [`canUseWebFsWriter()`](#canusewebfswriter) to check if it's available.

## Example

```tsx twoslash title="Using webFsWriter"
import {convertMedia} from '@remotion/webcodecs';
import {webFsWriter} from '@remotion/webcodecs/web-fs';

const result = await convertMedia({
  src: 'https://remotion.media/BigBuckBunny.mp4',
  container: 'webm',
  writer: webFsWriter,
});

const blob = await result.save();
```

## canUseWebFsWriter()

A function that returns a `Promise<boolean>` indicating whether the `webFsWriter` can be used in the current environment.

```tsx twoslash title="Checking availability"
import {canUseWebFsWriter, webFsWriter} from '@remotion/webcodecs/web-fs';

const canUse = await canUseWebFsWriter();
if (canUse) {
  // Use webFsWriter
} else {
  // Fall back to bufferWriter or another writer
}
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/webcodecs/src/writers/web-fs.ts)
- [`bufferWriter`](/docs/webcodecs/buffer-writer) - Alternative in-memory writer
- [`convertMedia()`](/docs/webcodecs/convert-media)
