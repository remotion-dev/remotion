# @remotion/effects

Effects that can be applied to Remotion-based canvas components.

## Usage

```tsx
import {Video} from '@remotion/media';
import {blur} from '@remotion/effects/blur';
import {wave} from '@remotion/effects/wave';

<Video
  src="https://remotion.media/video.mp4"
  effects={[blur({radius: 8}), wave({phase: 0, amplitude: 22, wavelength: 180})]}
/>;
```

See the [documentation](https://www.remotion.dev/docs/effects/api).
