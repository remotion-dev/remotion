---
name: effects
description: Canvas/WebGL visual effects for Remotion using effects arrays.
metadata:
  tags: effects, visual-effects, webgl, canvas, video
---

Use this rule only when the top-level skill lists an effect that matches the requested look.

Docs: https://www.remotion.dev/docs/effects

## Usage

Install the package that provides the chosen effect:

```bash
npx remotion add @remotion/effects
```

Use `npx remotion add @remotion/light-leaks` for `lightLeak()` and `npx remotion add @remotion/starburst` for `starburst()`.

Effects are functions passed to the `effects` prop of canvas-based components such as `<Video>` from `@remotion/media`, `<Solid>`, `<CanvasImage>`, and `<HtmlInCanvas>`.

```tsx
import {Video} from '@remotion/media';
import {blur} from '@remotion/effects/blur';

<Video src="https://remotion.media/video.mp4" effects={[blur({radius: 8})]} />;
```

Use the effect docs for exact props and imports. Most `@remotion/effects` imports use `@remotion/effects/<effect-slug>`; `uvTranslate()` and `xyTranslate()` use `@remotion/effects/translate`; `lightLeak()` uses `@remotion/light-leaks`; `starburst()` uses `@remotion/starburst`.

These effects use WebGL2. During renders, enable WebGL with:

```ts
import {Config} from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('angle');
```
