# @remotion/wordart

Classic WordArt text styles for Remotion: rainbow, orange 3D, blue wave, and chrome.

## Installation

```bash
npm install --save-exact @remotion/wordart
```

Keep all `remotion` and `@remotion/*` packages on the same version.

## Usage

```tsx
import {WordArt} from '@remotion/wordart';

export const Title = () => (
  <WordArt preset="rainbow" width={800} height={288}>
    WordArt
  </WordArt>
);
```

SVG text stays editable and scales without raster assets. The component does not animate automatically; use Remotion's frame-driven animations for `depth`, `distortion`, and `style`.

See the [documentation](https://www.remotion.dev/docs/wordart).
