# @remotion/wordart

Classic WordArt text styles for Remotion: rainbow, orange 3D, blue wave, and chrome.

## Installation

```bash
npm install --save-exact @remotion/wordart
```

Keep all `remotion` and `@remotion/*` packages on the same version.

## Usage

```tsx
import {RainbowWordArt} from '@remotion/wordart';

export const Title = () => (
  <RainbowWordArt width={800} height={288}>
    WordArt
  </RainbowWordArt>
);
```

Choose from `RainbowWordArt`, `OrangeWordArt`, `BlueWaveWordArt`, and `ChromeWordArt`. All four accept the shared `WordArtProps` type.

SVG text stays editable and scales without raster assets. The components do not animate automatically; use Remotion's frame-driven animations for `depth`, `distortion`, and `style`.

See the [documentation](https://www.remotion.dev/docs/wordart).
