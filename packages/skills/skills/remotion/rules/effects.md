---
name: effects
description: Canvas/WebGL visual effects for Remotion using effects arrays.
metadata:
  tags: effects, visual-effects, webgl, canvas, video
---

Use this rule only when the user asks for a visual effect that matches one of the available effects below. If no effect fits, do not force `@remotion/effects`; use normal Remotion animation, composition, canvas, or WebGL patterns instead.

Docs: https://www.remotion.dev/docs/effects

## Choosing an approach

Prefer normal Remotion components, HTML, CSS, SVG, masks, filters, blending, and animation when they can create the requested look without pixel manipulation.

If pixel manipulation is useful, use an existing effect from this list when it fits. To apply an existing effect to HTML, render the HTML through `<HtmlInCanvas>` and pass the effect in its `effects` prop.

Use `<HtmlInCanvas onPaint>` with custom canvas or WebGL code as a last resort when the requested effect is too specific or complex for HTML/CSS and no existing effect matches.

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

Use subpath imports. Do not import effects from the package root unless that effect's documentation says to.

These effects use WebGL2. During renders, enable WebGL with:

```ts
import {Config} from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('angle');
```

## Available effects

Color: `brightness()`, `contrast()`, `colorKey()`, `duotone()`, `grayscale()`, `hue()`, `invert()`, `saturation()`, `tint()`.

Blur & shadow: `blur()`, `linearProgressiveBlur()`, `dropShadow()`, `glow()`.

Reveal: `evolve()`.

Transform: `mirror()`, `scale()`, `uvTranslate()`, `xyTranslate()`.

Distort: `barrelDistortion()`, `chromaticAberration()`, `fisheye()`, `wave()`.

Stylize: `dotGrid()`, `halftone()`, `noise()`, `pixelDissolve()`, `scanlines()`, `speckle()`, `shine()`, `vignette()`.

Generate: `halftoneLinearGradient()`, `whiteNoise()`, `lines()`, `rings()`, `waves()`, `zigzag()`, `lightLeak()`, `starburst()`.

## Imports

- `barrelDistortion` from `@remotion/effects/barrel-distortion`
- `blur` from `@remotion/effects/blur`
- `brightness` from `@remotion/effects/brightness`
- `chromaticAberration` from `@remotion/effects/chromatic-aberration`
- `colorKey` from `@remotion/effects/color-key`
- `contrast` from `@remotion/effects/contrast`
- `dotGrid` from `@remotion/effects/dot-grid`
- `dropShadow` from `@remotion/effects/drop-shadow`
- `duotone` from `@remotion/effects/duotone`
- `evolve` from `@remotion/effects/evolve`
- `fisheye` from `@remotion/effects/fisheye`
- `glow` from `@remotion/effects/glow`
- `grayscale` from `@remotion/effects/grayscale`
- `halftone` from `@remotion/effects/halftone`
- `halftoneLinearGradient` from `@remotion/effects/halftone-linear-gradient`
- `hue` from `@remotion/effects/hue`
- `invert` from `@remotion/effects/invert`
- `lightLeak` from `@remotion/light-leaks`
- `linearProgressiveBlur` from `@remotion/effects/linear-progressive-blur`
- `lines` from `@remotion/effects/lines`
- `mirror` from `@remotion/effects/mirror`
- `noise` from `@remotion/effects/noise`
- `pixelDissolve` from `@remotion/effects/pixel-dissolve`
- `rings` from `@remotion/effects/rings`
- `saturation` from `@remotion/effects/saturation`
- `scale` from `@remotion/effects/scale`
- `scanlines` from `@remotion/effects/scanlines`
- `shine` from `@remotion/effects/shine`
- `speckle` from `@remotion/effects/speckle`
- `starburst` from `@remotion/starburst`
- `tint` from `@remotion/effects/tint`
- `uvTranslate` from `@remotion/effects/translate`
- `vignette` from `@remotion/effects/vignette`
- `wave` from `@remotion/effects/wave`
- `waves` from `@remotion/effects/waves`
- `whiteNoise` from `@remotion/effects/white-noise`
- `xyTranslate` from `@remotion/effects/translate`
- `zigzag` from `@remotion/effects/zigzag`

For exact props and examples, open the effect page at `https://www.remotion.dev/docs/effects/[effect-slug]`. Use `/docs/light-leaks/light-leak-effect` for `lightLeak()` and `/docs/starburst/starburst-effect` for `starburst()`.
