import type {EffectDescriptor} from 'remotion';

export type EffectPreviewFactory = (
	params: Record<string, unknown>,
) => EffectDescriptor<unknown>;

// Keep the import paths explicit so each effect can load on demand in Studio.
export const effectPreviewLoaders: Record<
	string,
	() => Promise<Record<string, unknown>>
> = {
	'@remotion/effects/brightness': () =>
		import('@remotion/effects/brightness?studio-preview'),
	'@remotion/effects/contrast': () =>
		import('@remotion/effects/contrast?studio-preview'),
	'@remotion/effects/color-correction': () =>
		import('@remotion/effects/color-correction?studio-preview'),
	'@remotion/effects/color-key': () =>
		import('@remotion/effects/color-key?studio-preview'),
	'@remotion/effects/curves': () =>
		import('@remotion/effects/curves?studio-preview'),
	'@remotion/effects/duotone': () =>
		import('@remotion/effects/duotone?studio-preview'),
	'@remotion/effects/exposure': () =>
		import('@remotion/effects/exposure?studio-preview'),
	'@remotion/effects/grayscale': () =>
		import('@remotion/effects/grayscale?studio-preview'),
	'@remotion/effects/hue': () => import('@remotion/effects/hue?studio-preview'),
	'@remotion/effects/invert': () =>
		import('@remotion/effects/invert?studio-preview'),
	'@remotion/effects/levels': () =>
		import('@remotion/effects/levels?studio-preview'),
	'@remotion/effects/lut': () => import('@remotion/effects/lut?studio-preview'),
	'@remotion/effects/saturation': () =>
		import('@remotion/effects/saturation?studio-preview'),
	'@remotion/effects/shadows-highlights': () =>
		import('@remotion/effects/shadows-highlights?studio-preview'),
	'@remotion/effects/tint': () =>
		import('@remotion/effects/tint?studio-preview'),
	'@remotion/effects/white-balance': () =>
		import('@remotion/effects/white-balance?studio-preview'),
	'@remotion/effects/vibrance': () =>
		import('@remotion/effects/vibrance?studio-preview'),
	'@remotion/effects/linear-gradient': () =>
		import('@remotion/effects/linear-gradient?studio-preview'),
	'@remotion/effects/linear-gradient-tint': () =>
		import('@remotion/effects/linear-gradient-tint?studio-preview'),
	'@remotion/effects/thermal-vision': () =>
		import('@remotion/effects/thermal-vision?studio-preview'),
	'@remotion/effects/blur': () =>
		import('@remotion/effects/blur?studio-preview'),
	'@remotion/effects/lens-blur': () =>
		import('@remotion/effects/lens-blur?studio-preview'),
	'@remotion/effects/linear-progressive-blur': () =>
		import('@remotion/effects/linear-progressive-blur?studio-preview'),
	'@remotion/effects/radial-progressive-blur': () =>
		import('@remotion/effects/radial-progressive-blur?studio-preview'),
	'@remotion/effects/region-blur': () =>
		import('@remotion/effects/region-blur?studio-preview'),
	'@remotion/effects/zoom-blur': () =>
		import('@remotion/effects/zoom-blur?studio-preview'),
	'@remotion/effects/drop-shadow': () =>
		import('@remotion/effects/drop-shadow?studio-preview'),
	'@remotion/effects/long-shadows': () =>
		import('@remotion/effects/long-shadows?studio-preview'),
	'@remotion/effects/glow': () =>
		import('@remotion/effects/glow?studio-preview'),
	'@remotion/effects/outline': () =>
		import('@remotion/effects/outline?studio-preview'),
	'@remotion/effects/light-trail': () =>
		import('@remotion/effects/light-trail?studio-preview'),
	'@remotion/effects/evolve': () =>
		import('@remotion/effects/evolve?studio-preview'),
	'@remotion/effects/tear': () =>
		import('@remotion/effects/tear?studio-preview'),
	'@remotion/effects/film-burn': () =>
		import('@remotion/effects/film-burn?studio-preview'),
	'@remotion/effects/radial-wipe': () =>
		import('@remotion/effects/radial-wipe?studio-preview'),
	'@remotion/effects/iris-wipe': () =>
		import('@remotion/effects/iris-wipe?studio-preview'),
	'@remotion/effects/venetian-blinds': () =>
		import('@remotion/effects/venetian-blinds?studio-preview'),
	'@remotion/effects/mirror': () =>
		import('@remotion/effects/mirror?studio-preview'),
	'@remotion/effects/scale': () =>
		import('@remotion/effects/scale?studio-preview'),
	'@remotion/effects/tile': () =>
		import('@remotion/effects/tile?studio-preview'),
	'@remotion/effects/translate': () =>
		import('@remotion/effects/translate?studio-preview'),
	'@remotion/effects/barrel-distortion': () =>
		import('@remotion/effects/barrel-distortion?studio-preview'),
	'@remotion/effects/chromatic-aberration': () =>
		import('@remotion/effects/chromatic-aberration?studio-preview'),
	'@remotion/effects/fisheye': () =>
		import('@remotion/effects/fisheye?studio-preview'),
	'@remotion/effects/corner-pin': () =>
		import('@remotion/effects/corner-pin?studio-preview'),
	'@remotion/effects/page-turn': () =>
		import('@remotion/effects/page-turn?studio-preview'),
	'@remotion/effects/sphere': () =>
		import('@remotion/effects/sphere?studio-preview'),
	'@remotion/effects/cylinder': () =>
		import('@remotion/effects/cylinder?studio-preview'),
	'@remotion/effects/wave': () =>
		import('@remotion/effects/wave?studio-preview'),
	'@remotion/effects/skew': () =>
		import('@remotion/effects/skew?studio-preview'),
	'@remotion/effects/turbulent-displace': () =>
		import('@remotion/effects/turbulent-displace?studio-preview'),
	'@remotion/effects/burlap': () =>
		import('@remotion/effects/burlap?studio-preview'),
	'@remotion/effects/bevel-alpha': () =>
		import('@remotion/effects/bevel-alpha?studio-preview'),
	'@remotion/effects/emboss': () =>
		import('@remotion/effects/emboss?studio-preview'),
	'@remotion/effects/dot-grid': () =>
		import('@remotion/effects/dot-grid?studio-preview'),
	'@remotion/effects/halftone': () =>
		import('@remotion/effects/halftone?studio-preview'),
	'@remotion/effects/noise': () =>
		import('@remotion/effects/noise?studio-preview'),
	'@remotion/effects/noise-displacement': () =>
		import('@remotion/effects/noise-displacement?studio-preview'),
	'@remotion/effects/paper': () =>
		import('@remotion/effects/paper?studio-preview'),
	'@remotion/effects/roughen-edges': () =>
		import('@remotion/effects/roughen-edges?studio-preview'),
	'@remotion/effects/pattern': () =>
		import('@remotion/effects/pattern?studio-preview'),
	'@remotion/effects/pixel-dissolve': () =>
		import('@remotion/effects/pixel-dissolve?studio-preview'),
	'@remotion/effects/pixelate': () =>
		import('@remotion/effects/pixelate?studio-preview'),
	'@remotion/effects/linear-progressive-pixelate': () =>
		import('@remotion/effects/linear-progressive-pixelate?studio-preview'),
	'@remotion/effects/radial-progressive-pixelate': () =>
		import('@remotion/effects/radial-progressive-pixelate?studio-preview'),
	'@remotion/effects/scanlines': () =>
		import('@remotion/effects/scanlines?studio-preview'),
	'@remotion/effects/speckle': () =>
		import('@remotion/effects/speckle?studio-preview'),
	'@remotion/effects/shatter': () =>
		import('@remotion/effects/shatter?studio-preview'),
	'@remotion/effects/shine': () =>
		import('@remotion/effects/shine?studio-preview'),
	'@remotion/effects/shrinkwrap': () =>
		import('@remotion/effects/shrinkwrap?studio-preview'),
	'@remotion/effects/vignette': () =>
		import('@remotion/effects/vignette?studio-preview'),
	'@remotion/effects/rain-fall': () =>
		import('@remotion/effects/rain-fall?studio-preview'),
	'@remotion/effects/snow-fall': () =>
		import('@remotion/effects/snow-fall?studio-preview'),
	'@remotion/effects/fractal-noise': () =>
		import('@remotion/effects/fractal-noise?studio-preview'),
	'@remotion/effects/contour-lines': () =>
		import('@remotion/effects/contour-lines?studio-preview'),
	'@remotion/effects/liquid-contours': () =>
		import('@remotion/effects/liquid-contours?studio-preview'),
	'@remotion/effects/checkerboard': () =>
		import('@remotion/effects/checkerboard?studio-preview'),
	'@remotion/effects/flannel': () =>
		import('@remotion/effects/flannel?studio-preview'),
	'@remotion/effects/halftone-linear-gradient': () =>
		import('@remotion/effects/halftone-linear-gradient?studio-preview'),
	'@remotion/effects/gridlines': () =>
		import('@remotion/effects/gridlines?studio-preview'),
	'@remotion/effects/white-noise': () =>
		import('@remotion/effects/white-noise?studio-preview'),
	'@remotion/effects/tv-signal-off': () =>
		import('@remotion/effects/tv-signal-off?studio-preview'),
	'@remotion/effects/lines': () =>
		import('@remotion/effects/lines?studio-preview'),
	'@remotion/effects/rings': () =>
		import('@remotion/effects/rings?studio-preview'),
	'@remotion/effects/waves': () =>
		import('@remotion/effects/waves?studio-preview'),
	'@remotion/effects/zigzag': () =>
		import('@remotion/effects/zigzag?studio-preview'),
	'@remotion/effects/light-leak': () =>
		import('@remotion/effects/light-leak?studio-preview'),
	'@remotion/effects/starburst': () =>
		import('@remotion/effects/starburst?studio-preview'),
};

// Rspack changes these imports when effects move between lazy and initial chunks.
// Keep those updates inside this stateless module instead of reloading Studio.
if (typeof __webpack_module__ !== 'undefined' && __webpack_module__.hot) {
	__webpack_module__.hot.accept();
}
