import type {EffectDescriptor} from 'remotion';

export type EffectPreviewFactory = (
	params: Record<string, unknown>,
) => EffectDescriptor<unknown>;

// Keep the import paths explicit so each effect can load on demand in Studio.
export const effectPreviewLoaders: Record<
	string,
	() => Promise<Record<string, unknown>>
> = {
	'@remotion/effects/brightness': () => import('@remotion/effects/brightness'),
	'@remotion/effects/contrast': () => import('@remotion/effects/contrast'),
	'@remotion/effects/color-correction': () =>
		import('@remotion/effects/color-correction'),
	'@remotion/effects/color-key': () => import('@remotion/effects/color-key'),
	'@remotion/effects/duotone': () => import('@remotion/effects/duotone'),
	'@remotion/effects/exposure': () => import('@remotion/effects/exposure'),
	'@remotion/effects/grayscale': () => import('@remotion/effects/grayscale'),
	'@remotion/effects/hue': () => import('@remotion/effects/hue'),
	'@remotion/effects/invert': () => import('@remotion/effects/invert'),
	'@remotion/effects/levels': () => import('@remotion/effects/levels'),
	'@remotion/effects/lut': () => import('@remotion/effects/lut'),
	'@remotion/effects/saturation': () => import('@remotion/effects/saturation'),
	'@remotion/effects/shadows-highlights': () =>
		import('@remotion/effects/shadows-highlights'),
	'@remotion/effects/tint': () => import('@remotion/effects/tint'),
	'@remotion/effects/white-balance': () =>
		import('@remotion/effects/white-balance'),
	'@remotion/effects/vibrance': () => import('@remotion/effects/vibrance'),
	'@remotion/effects/linear-gradient': () =>
		import('@remotion/effects/linear-gradient'),
	'@remotion/effects/linear-gradient-tint': () =>
		import('@remotion/effects/linear-gradient-tint'),
	'@remotion/effects/thermal-vision': () =>
		import('@remotion/effects/thermal-vision'),
	'@remotion/effects/blur': () => import('@remotion/effects/blur'),
	'@remotion/effects/linear-progressive-blur': () =>
		import('@remotion/effects/linear-progressive-blur'),
	'@remotion/effects/radial-progressive-blur': () =>
		import('@remotion/effects/radial-progressive-blur'),
	'@remotion/effects/region-blur': () =>
		import('@remotion/effects/region-blur'),
	'@remotion/effects/zoom-blur': () => import('@remotion/effects/zoom-blur'),
	'@remotion/effects/drop-shadow': () =>
		import('@remotion/effects/drop-shadow'),
	'@remotion/effects/glow': () => import('@remotion/effects/glow'),
	'@remotion/effects/outline': () => import('@remotion/effects/outline'),
	'@remotion/effects/light-trail': () =>
		import('@remotion/effects/light-trail'),
	'@remotion/effects/evolve': () => import('@remotion/effects/evolve'),
	'@remotion/effects/tear': () => import('@remotion/effects/tear'),
	'@remotion/effects/venetian-blinds': () =>
		import('@remotion/effects/venetian-blinds'),
	'@remotion/effects/mirror': () => import('@remotion/effects/mirror'),
	'@remotion/effects/scale': () => import('@remotion/effects/scale'),
	'@remotion/effects/tile': () => import('@remotion/effects/tile'),
	'@remotion/effects/translate': () => import('@remotion/effects/translate'),
	'@remotion/effects/barrel-distortion': () =>
		import('@remotion/effects/barrel-distortion'),
	'@remotion/effects/chromatic-aberration': () =>
		import('@remotion/effects/chromatic-aberration'),
	'@remotion/effects/fisheye': () => import('@remotion/effects/fisheye'),
	'@remotion/effects/corner-pin': () => import('@remotion/effects/corner-pin'),
	'@remotion/effects/wave': () => import('@remotion/effects/wave'),
	'@remotion/effects/skew': () => import('@remotion/effects/skew'),
	'@remotion/effects/burlap': () => import('@remotion/effects/burlap'),
	'@remotion/effects/emboss': () => import('@remotion/effects/emboss'),
	'@remotion/effects/dot-grid': () => import('@remotion/effects/dot-grid'),
	'@remotion/effects/halftone': () => import('@remotion/effects/halftone'),
	'@remotion/effects/noise': () => import('@remotion/effects/noise'),
	'@remotion/effects/noise-displacement': () =>
		import('@remotion/effects/noise-displacement'),
	'@remotion/effects/paper': () => import('@remotion/effects/paper'),
	'@remotion/effects/roughen-edges': () =>
		import('@remotion/effects/roughen-edges'),
	'@remotion/effects/pattern': () => import('@remotion/effects/pattern'),
	'@remotion/effects/pixel-dissolve': () =>
		import('@remotion/effects/pixel-dissolve'),
	'@remotion/effects/pixelate': () => import('@remotion/effects/pixelate'),
	'@remotion/effects/linear-progressive-pixelate': () =>
		import('@remotion/effects/linear-progressive-pixelate'),
	'@remotion/effects/radial-progressive-pixelate': () =>
		import('@remotion/effects/radial-progressive-pixelate'),
	'@remotion/effects/scanlines': () => import('@remotion/effects/scanlines'),
	'@remotion/effects/speckle': () => import('@remotion/effects/speckle'),
	'@remotion/effects/shine': () => import('@remotion/effects/shine'),
	'@remotion/effects/shrinkwrap': () => import('@remotion/effects/shrinkwrap'),
	'@remotion/effects/vignette': () => import('@remotion/effects/vignette'),
	'@remotion/effects/contour-lines': () =>
		import('@remotion/effects/contour-lines'),
	'@remotion/effects/liquid-contours': () =>
		import('@remotion/effects/liquid-contours'),
	'@remotion/effects/checkerboard': () =>
		import('@remotion/effects/checkerboard'),
	'@remotion/effects/flannel': () => import('@remotion/effects/flannel'),
	'@remotion/effects/halftone-linear-gradient': () =>
		import('@remotion/effects/halftone-linear-gradient'),
	'@remotion/effects/gridlines': () => import('@remotion/effects/gridlines'),
	'@remotion/effects/white-noise': () =>
		import('@remotion/effects/white-noise'),
	'@remotion/effects/tv-signal-off': () =>
		import('@remotion/effects/tv-signal-off'),
	'@remotion/effects/lines': () => import('@remotion/effects/lines'),
	'@remotion/effects/rings': () => import('@remotion/effects/rings'),
	'@remotion/effects/waves': () => import('@remotion/effects/waves'),
	'@remotion/effects/zigzag': () => import('@remotion/effects/zigzag'),
	'@remotion/effects/light-leak': () => import('@remotion/effects/light-leak'),
	'@remotion/effects/starburst': () => import('@remotion/effects/starburst'),
};
