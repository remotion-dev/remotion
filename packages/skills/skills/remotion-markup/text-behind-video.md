---
name: text-behind-video
description: Put text behind a subject using AbsoluteFill layer order plus a transparent or greenscreen foreground.
metadata:
  tags: text, layers, greenscreen, transparent, color-key, absolute-fill
---

# Text behind video

Stack layers so text sits under a subject with transparency: background (optional), text, then foreground.

Docs: https://www.remotion.dev/docs/text-behind-video

Use [`<AbsoluteFill>`](https://www.remotion.dev/docs/absolute-fill) and render later children on top. Prefer tree order over `z-index`.

## Greenscreen subject

Install `@remotion/effects` and remove the green with `colorKey()`:

```tsx
import {colorKey} from '@remotion/effects/color-key';
import {Video} from '@remotion/media';
import {AbsoluteFill} from 'remotion';

export const TextBehindVideo = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#0b1020'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontSize: 120, fontWeight: 800, color: 'white'}}>HELLO</div>
      </AbsoluteFill>
      <AbsoluteFill>
        <Video src="https://remotion.media/greenscreen.mp4" effects={[colorKey({similarity: 0.45})]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

`colorKey()` needs WebGL2. For renders, set `Config.setChromiumOpenGlRenderer('angle')`.

## Transparent video or cutout image

If the subject already has alpha, put `<Video>` or `<Img>` above the text with no color key.

See also: [Layers](https://www.remotion.dev/docs/layers), [Greenscreen](https://www.remotion.dev/docs/greenscreen), [Embedding transparent videos](https://www.remotion.dev/docs/videos/transparency).
