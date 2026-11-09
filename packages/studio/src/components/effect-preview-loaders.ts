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
		import('@remotion/effects/brightness/preview'),
	'@remotion/effects/contrast': () =>
		import('@remotion/effects/contrast/preview'),
	'@remotion/effects/color-correction': () =>
		import('@remotion/effects/color-correction/preview'),
	'@remotion/effects/color-key': () =>
		import('@remotion/effects/color-key/preview'),
	'@remotion/effects/curves': () => import('@remotion/effects/curves/preview'),
	'@remotion/effects/duotone': () =>
		import('@remotion/effects/duotone/preview'),
	'@remotion/effects/exposure': () =>
		import('@remotion/effects/exposure/preview'),
	'@remotion/effects/grayscale': () =>
		import('@remotion/effects/grayscale/preview'),
	'@remotion/effects/hue': () => import('@remotion/effects/hue/preview'),
	'@remotion/effects/invert': () => import('@remotion/effects/invert/preview'),
	'@remotion/effects/levels': () => import('@remotion/effects/levels/preview'),
	'@remotion/effects/lut': () => import('@remotion/effects/lut/preview'),
	'@remotion/effects/saturation': () =>
		import('@remotion/effects/saturation/preview'),
	'@remotion/effects/shadows-highlights': () =>
		import('@remotion/effects/shadows-highlights/preview'),
	'@remotion/effects/tint': () => import('@remotion/effects/tint/preview'),
	'@remotion/effects/white-balance': () =>
		import('@remotion/effects/white-balance/preview'),
	'@remotion/effects/vibrance': () =>
		import('@remotion/effects/vibrance/preview'),
	'@remotion/effects/linear-gradient': () =>
		import('@remotion/effects/linear-gradient/preview'),
	'@remotion/effects/linear-gradient-tint': () =>
		import('@remotion/effects/linear-gradient-tint/preview'),
	'@remotion/effects/thermal-vision': () =>
		import('@remotion/effects/thermal-vision/preview'),
	'@remotion/effects/blur': () => import('@remotion/effects/blur/preview'),
	'@remotion/effects/lens-blur': () =>
		import('@remotion/effects/lens-blur/preview'),
	'@remotion/effects/linear-progressive-blur': () =>
		import('@remotion/effects/linear-progressive-blur/preview'),
	'@remotion/effects/radial-progressive-blur': () =>
		import('@remotion/effects/radial-progressive-blur/preview'),
	'@remotion/effects/region-blur': () =>
		import('@remotion/effects/region-blur/preview'),
	'@remotion/effects/zoom-blur': () =>
		import('@remotion/effects/zoom-blur/preview'),
	'@remotion/effects/drop-shadow': () =>
		import('@remotion/effects/drop-shadow/preview'),
	'@remotion/effects/long-shadows': () =>
		import('@remotion/effects/long-shadows/preview'),
	'@remotion/effects/glow': () => import('@remotion/effects/glow/preview'),
	'@remotion/effects/outline': () =>
		import('@remotion/effects/outline/preview'),
	'@remotion/effects/light-trail': () =>
		import('@remotion/effects/light-trail/preview'),
	'@remotion/effects/evolve': () => import('@remotion/effects/evolve/preview'),
	'@remotion/effects/tear': () => import('@remotion/effects/tear/preview'),
	'@remotion/effects/film-burn': () =>
		import('@remotion/effects/film-burn/preview'),
	'@remotion/effects/radial-wipe': () =>
		import('@remotion/effects/radial-wipe/preview'),
	'@remotion/effects/iris-wipe': () =>
		import('@remotion/effects/iris-wipe/preview'),
	'@remotion/effects/venetian-blinds': () =>
		import('@remotion/effects/venetian-blinds/preview'),
	'@remotion/effects/mirror': () => import('@remotion/effects/mirror/preview'),
	'@remotion/effects/scale': () => import('@remotion/effects/scale/preview'),
	'@remotion/effects/tile': () => import('@remotion/effects/tile/preview'),
	'@remotion/effects/translate': () =>
		import('@remotion/effects/translate/preview'),
	'@remotion/effects/barrel-distortion': () =>
		import('@remotion/effects/barrel-distortion/preview'),
	'@remotion/effects/chromatic-aberration': () =>
		import('@remotion/effects/chromatic-aberration/preview'),
	'@remotion/effects/magnify': () =>
		import('@remotion/effects/magnify/preview'),
	'@remotion/effects/fisheye': () =>
		import('@remotion/effects/fisheye/preview'),
	'@remotion/effects/corner-pin': () =>
		import('@remotion/effects/corner-pin/preview'),
	'@remotion/effects/page-turn': () =>
		import('@remotion/effects/page-turn/preview'),
	'@remotion/effects/sphere': () => import('@remotion/effects/sphere/preview'),
	'@remotion/effects/cylinder': () =>
		import('@remotion/effects/cylinder/preview'),
	'@remotion/effects/wave': () => import('@remotion/effects/wave/preview'),
	'@remotion/effects/skew': () => import('@remotion/effects/skew/preview'),
	'@remotion/effects/turbulent-displace': () =>
		import('@remotion/effects/turbulent-displace/preview'),
	'@remotion/effects/burlap': () => import('@remotion/effects/burlap/preview'),
	'@remotion/effects/bevel-alpha': () =>
		import('@remotion/effects/bevel-alpha/preview'),
	'@remotion/effects/emboss': () => import('@remotion/effects/emboss/preview'),
	'@remotion/effects/dot-grid': () =>
		import('@remotion/effects/dot-grid/preview'),
	'@remotion/effects/halftone': () =>
		import('@remotion/effects/halftone/preview'),
	'@remotion/effects/noise': () => import('@remotion/effects/noise/preview'),
	'@remotion/effects/noise-displacement': () =>
		import('@remotion/effects/noise-displacement/preview'),
	'@remotion/effects/paper': () => import('@remotion/effects/paper/preview'),
	'@remotion/effects/roughen-edges': () =>
		import('@remotion/effects/roughen-edges/preview'),
	'@remotion/effects/pattern': () =>
		import('@remotion/effects/pattern/preview'),
	'@remotion/effects/pixel-dissolve': () =>
		import('@remotion/effects/pixel-dissolve/preview'),
	'@remotion/effects/pixelate': () =>
		import('@remotion/effects/pixelate/preview'),
	'@remotion/effects/linear-progressive-pixelate': () =>
		import('@remotion/effects/linear-progressive-pixelate/preview'),
	'@remotion/effects/radial-progressive-pixelate': () =>
		import('@remotion/effects/radial-progressive-pixelate/preview'),
	'@remotion/effects/scanlines': () =>
		import('@remotion/effects/scanlines/preview'),
	'@remotion/effects/speckle': () =>
		import('@remotion/effects/speckle/preview'),
	'@remotion/effects/shatter': () =>
		import('@remotion/effects/shatter/preview'),
	'@remotion/effects/shine': () => import('@remotion/effects/shine/preview'),
	'@remotion/effects/shrinkwrap': () =>
		import('@remotion/effects/shrinkwrap/preview'),
	'@remotion/effects/vignette': () =>
		import('@remotion/effects/vignette/preview'),
	'@remotion/effects/lightning': () =>
		import('@remotion/effects/lightning/preview'),
	'@remotion/effects/rain-fall': () =>
		import('@remotion/effects/rain-fall/preview'),
	'@remotion/effects/snow-fall': () =>
		import('@remotion/effects/snow-fall/preview'),
	'@remotion/effects/fractal-noise': () =>
		import('@remotion/effects/fractal-noise/preview'),
	'@remotion/effects/contour-lines': () =>
		import('@remotion/effects/contour-lines/preview'),
	'@remotion/effects/liquid-contours': () =>
		import('@remotion/effects/liquid-contours/preview'),
	'@remotion/effects/checkerboard': () =>
		import('@remotion/effects/checkerboard/preview'),
	'@remotion/effects/flannel': () =>
		import('@remotion/effects/flannel/preview'),
	'@remotion/effects/halftone-linear-gradient': () =>
		import('@remotion/effects/halftone-linear-gradient/preview'),
	'@remotion/effects/gridlines': () =>
		import('@remotion/effects/gridlines/preview'),
	'@remotion/effects/white-noise': () =>
		import('@remotion/effects/white-noise/preview'),
	'@remotion/effects/tv-signal-off': () =>
		import('@remotion/effects/tv-signal-off/preview'),
	'@remotion/effects/lines': () => import('@remotion/effects/lines/preview'),
	'@remotion/effects/rings': () => import('@remotion/effects/rings/preview'),
	'@remotion/effects/waves': () => import('@remotion/effects/waves/preview'),
	'@remotion/effects/zigzag': () => import('@remotion/effects/zigzag/preview'),
	'@remotion/effects/light-leak': () =>
		import('@remotion/effects/light-leak/preview'),
	'@remotion/effects/starburst': () =>
		import('@remotion/effects/starburst/preview'),
};

// Rspack changes these imports when effects move between lazy and initial chunks.
// Keep those updates inside this stateless module instead of reloading Studio.
if (
	typeof __webpack_module__ !== 'undefined' &&
	typeof __webpack_module__.hot?.accept === 'function'
) {
	__webpack_module__.hot.accept();
}
