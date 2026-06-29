import {barrelDistortion} from '@remotion/effects/barrel-distortion';
import {blur} from '@remotion/effects/blur';
import {brightness} from '@remotion/effects/brightness';
import {burlap} from '@remotion/effects/burlap';
import {checkerboard} from '@remotion/effects/checkerboard';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {colorKey} from '@remotion/effects/color-key';
import {contourLines} from '@remotion/effects/contour-lines';
import {contrast} from '@remotion/effects/contrast';
import {cornerPin} from '@remotion/effects/corner-pin';
import {dotGrid} from '@remotion/effects/dot-grid';
import {dropShadow} from '@remotion/effects/drop-shadow';
import {duotone} from '@remotion/effects/duotone';
import {emboss} from '@remotion/effects/emboss';
import {evolve} from '@remotion/effects/evolve';
import {fisheye} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {grayscale} from '@remotion/effects/grayscale';
import {gridlines} from '@remotion/effects/gridlines';
import {halftone} from '@remotion/effects/halftone';
import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import {hue} from '@remotion/effects/hue';
import {invert} from '@remotion/effects/invert';
import {lightTrail} from '@remotion/effects/light-trail';
import {linearGradientTint} from '@remotion/effects/linear-gradient-tint';
import {linearGradient} from '@remotion/effects/linear-gradient';
import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {lines} from '@remotion/effects/lines';
import {mirror} from '@remotion/effects/mirror';
import {noise} from '@remotion/effects/noise';
import {noiseDisplacement} from '@remotion/effects/noise-displacement';
import {pattern} from '@remotion/effects/pattern';
import {pixelDissolve} from '@remotion/effects/pixel-dissolve';
import {pixelate} from '@remotion/effects/pixelate';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {rings} from '@remotion/effects/rings';
import {saturation} from '@remotion/effects/saturation';
import {scale} from '@remotion/effects/scale';
import {scanlines} from '@remotion/effects/scanlines';
import {shine} from '@remotion/effects/shine';
import {shrinkwrap} from '@remotion/effects/shrinkwrap';
import {speckle} from '@remotion/effects/speckle';
import {thermalVision} from '@remotion/effects/thermal-vision';
import {tint} from '@remotion/effects/tint';
import {uvTranslate, xyTranslate} from '@remotion/effects/translate';
import {tvSignalOff} from '@remotion/effects/tv-signal-off';
import {venetianBlinds} from '@remotion/effects/venetian-blinds';
import {vignette} from '@remotion/effects/vignette';
import {wave} from '@remotion/effects/wave';
import {waves} from '@remotion/effects/waves';
import {whiteNoise} from '@remotion/effects/white-noise';
import {zigzag} from '@remotion/effects/zigzag';
import {zoomBlur} from '@remotion/effects/zoom-blur';
import {lightLeakEffectSchema} from '@remotion/light-leaks';
import {starburstEffectSchema} from '@remotion/starburst';
import {EffectsBarrelDistortionPreview} from '../effects/effects-barrel-distortion-preview';
import {EffectsBlurPreview} from '../effects/effects-blur-preview';
import {EffectsBrightnessPreview} from '../effects/effects-brightness-preview';
import {EffectsBurlapPreview} from '../effects/effects-burlap-preview';
import {EffectsCheckerboardPreview} from '../effects/effects-checkerboard-preview';
import {EffectsChromaticAberrationPreview} from '../effects/effects-chromatic-aberration-preview';
import {EffectsColorKeyPreview} from '../effects/effects-color-key-preview';
import {EffectsContourLinesPreview} from '../effects/effects-contour-lines-preview';
import {EffectsContrastPreview} from '../effects/effects-contrast-preview';
import {EffectsCornerPinPreview} from '../effects/effects-corner-pin-preview';
import {EffectsDotGridPreview} from '../effects/effects-dot-grid-preview';
import {EffectsDropShadowPreview} from '../effects/effects-drop-shadow-preview';
import {EffectsDuotonePreview} from '../effects/effects-duotone-preview';
import {EffectsEmbossPreview} from '../effects/effects-emboss-preview';
import {EffectsEvolvePreview} from '../effects/effects-evolve-preview';
import {EffectsFisheyePreview} from '../effects/effects-fisheye-preview';
import {EffectsGlowPreview} from '../effects/effects-glow-preview';
import {EffectsGrayscalePreview} from '../effects/effects-grayscale-preview';
import {EffectsGridlinesPreview} from '../effects/effects-gridlines-preview';
import {EffectsHalftoneLinearGradientPreview} from '../effects/effects-halftone-linear-gradient-preview';
import {EffectsHalftonePreview} from '../effects/effects-halftone-preview';
import {EffectsHuePreview} from '../effects/effects-hue-preview';
import {EffectsInvertPreview} from '../effects/effects-invert-preview';
import {EffectsLightLeakPreview} from '../effects/effects-light-leak-preview';
import {
	EffectsLightTrailPreview,
	LIGHT_TRAIL_PREVIEW_PARAMS,
} from '../effects/effects-light-trail-preview';
import {EffectsLinearGradientTintPreview} from '../effects/effects-linear-gradient-tint-preview';
import {EffectsLinearGradientPreview} from '../effects/effects-linear-gradient-preview';
import {EffectsLinearProgressiveBlurPreview} from '../effects/effects-linear-progressive-blur-preview';
import {EffectsLinesPreview} from '../effects/effects-lines-preview';
import {EffectsMirrorPreview} from '../effects/effects-mirror-preview';
import {
	EffectsNoiseDisplacementPreview,
	NOISE_DISPLACEMENT_PREVIEW_PARAMS,
} from '../effects/effects-noise-displacement-preview';
import {EffectsNoisePreview} from '../effects/effects-noise-preview';
import {
	EffectsPaletteMapPreview,
	paletteMap,
} from '../effects/effects-palette-map-preview';
import {EffectsPatternPreview} from '../effects/effects-pattern-preview';
import {EffectsPixelDissolvePreview} from '../effects/effects-pixel-dissolve-preview';
import {EffectsPixelatePreview} from '../effects/effects-pixelate-preview';
import {
	EffectsRadialProgressiveBlurPreview,
	RADIAL_PROGRESSIVE_BLUR_PREVIEW_PARAMS,
} from '../effects/effects-radial-progressive-blur-preview';
import {EffectsRingsPreview} from '../effects/effects-rings-preview';
import {EffectsSaturationPreview} from '../effects/effects-saturation-preview';
import {EffectsScalePreview} from '../effects/effects-scale-preview';
import {EffectsScanlinesPreview} from '../effects/effects-scanlines-preview';
import {EffectsShinePreview} from '../effects/effects-shine-preview';
import {
	EffectsShrinkwrapPreview,
	SHRINKWRAP_PREVIEW_PARAMS,
} from '../effects/effects-shrinkwrap-preview';
import {EffectsSpecklePreview} from '../effects/effects-speckle-preview';
import {EffectsStarburstPreview} from '../effects/effects-starburst-preview';
import {EffectsThermalVisionPreview} from '../effects/effects-thermal-vision-preview';
import {EffectsTintPreview} from '../effects/effects-tint-preview';
import {
	EffectsUvTranslatePreview,
	EffectsXyTranslatePreview,
} from '../effects/effects-translate-preview';
import {EffectsTvSignalOffPreview} from '../effects/effects-tv-signal-off-preview';
import {EffectsVenetianBlindsPreview} from '../effects/effects-venetian-blinds-preview';
import {EffectsVignettePreview} from '../effects/effects-vignette-preview';
import {EffectsWavePreview} from '../effects/effects-wave-preview';
import {EffectsWavesPreview} from '../effects/effects-waves-preview';
import {EffectsWhiteNoisePreview} from '../effects/effects-white-noise-preview';
import {EffectsZigzagPreview} from '../effects/effects-zigzag-preview';
import {EffectsZoomBlurPreview} from '../effects/effects-zoom-blur-preview';
import type {EffectsDemoType} from './types';

const defaults = {
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	autoPlay: false,
	controls: false,
	logLevel: 'info',
} as const;

const shrinkwrapDemoSchema = {
	...shrinkwrap().definition.schema,
	phase: {
		...shrinkwrap().definition.schema.phase,
		min: -10,
		max: 10,
	},
} as const;

export const effectsDemos: EffectsDemoType[] = [
	{
		...defaults,
		id: 'effects-brightness',
		effectName: 'brightness',
		effectImportPath: '@remotion/effects/brightness',
		comp: EffectsBrightnessPreview,
		schema: brightness().definition.schema,
	},
	{
		...defaults,
		id: 'effects-burlap',
		effectName: 'burlap',
		effectImportPath: '@remotion/effects/burlap',
		comp: EffectsBurlapPreview,
		schema: burlap().definition.schema,
	},
	{
		...defaults,
		id: 'effects-emboss',
		effectName: 'emboss',
		effectImportPath: '@remotion/effects/emboss',
		comp: EffectsEmbossPreview,
		schema: emboss().definition.schema,
	},
	{
		...defaults,
		id: 'effects-contrast',
		effectName: 'contrast',
		effectImportPath: '@remotion/effects/contrast',
		comp: EffectsContrastPreview,
		schema: contrast().definition.schema,
	},
	{
		...defaults,
		id: 'effects-color-key',
		effectName: 'colorKey',
		effectImportPath: '@remotion/effects/color-key',
		comp: EffectsColorKeyPreview,
		schema: colorKey().definition.schema,
		durationInFrames: 150,
		autoPlay: true,
		initialValues: {
			similarity: 0.45,
		},
	},
	{
		...defaults,
		id: 'effects-duotone',
		effectName: 'duotone',
		effectImportPath: '@remotion/effects/duotone',
		comp: EffectsDuotonePreview,
		schema: duotone().definition.schema,
	},
	{
		...defaults,
		id: 'effects-evolve',
		effectName: 'evolve',
		effectImportPath: '@remotion/effects/evolve',
		comp: EffectsEvolvePreview,
		schema: evolve().definition.schema,
	},
	{
		...defaults,
		id: 'effects-venetian-blinds',
		effectName: 'venetianBlinds',
		effectImportPath: '@remotion/effects/venetian-blinds',
		comp: EffectsVenetianBlindsPreview,
		schema: venetianBlinds().definition.schema,
	},
	{
		...defaults,
		id: 'effects-drop-shadow',
		effectName: 'dropShadow',
		effectImportPath: '@remotion/effects/drop-shadow',
		comp: EffectsDropShadowPreview,
		schema: dropShadow().definition.schema,
	},
	{
		...defaults,
		id: 'effects-glow',
		effectName: 'glow',
		effectImportPath: '@remotion/effects/glow',
		comp: EffectsGlowPreview,
		schema: glow().definition.schema,
	},
	{
		...defaults,
		id: 'effects-grayscale',
		effectName: 'grayscale',
		effectImportPath: '@remotion/effects/grayscale',
		comp: EffectsGrayscalePreview,
		schema: grayscale().definition.schema,
	},
	{
		...defaults,
		id: 'effects-hue',
		effectName: 'hue',
		effectImportPath: '@remotion/effects/hue',
		comp: EffectsHuePreview,
		schema: hue().definition.schema,
	},
	{
		...defaults,
		id: 'effects-invert',
		effectName: 'invert',
		effectImportPath: '@remotion/effects/invert',
		comp: EffectsInvertPreview,
		schema: invert().definition.schema,
	},
	{
		...defaults,
		id: 'effects-saturation',
		effectName: 'saturation',
		effectImportPath: '@remotion/effects/saturation',
		comp: EffectsSaturationPreview,
		schema: saturation().definition.schema,
	},
	{
		...defaults,
		id: 'effects-tint',
		effectName: 'tint',
		effectImportPath: '@remotion/effects/tint',
		comp: EffectsTintPreview,
		schema: tint({color: '#1ec8ff'}).definition.schema,
		initialValues: {
			color: '#1ec8ff',
		},
	},
	{
		...defaults,
		id: 'effects-linear-gradient',
		effectName: 'linearGradient',
		effectImportPath: '@remotion/effects/linear-gradient',
		comp: EffectsLinearGradientPreview,
		schema: linearGradient().definition.schema,
	},
	{
		...defaults,
		id: 'effects-linear-gradient-tint',
		effectName: 'linearGradientTint',
		effectImportPath: '@remotion/effects/linear-gradient-tint',
		comp: EffectsLinearGradientTintPreview,
		schema: linearGradientTint().definition.schema,
	},
	{
		...defaults,
		id: 'effects-thermal-vision',
		effectName: 'thermalVision',
		effectImportPath: '@remotion/effects/thermal-vision',
		comp: EffectsThermalVisionPreview,
		schema: thermalVision().definition.schema,
	},
	{
		...defaults,
		id: 'effects-shine',
		effectName: 'shine',
		effectImportPath: '@remotion/effects/shine',
		comp: EffectsShinePreview,
		schema: shine().definition.schema,
	},
	{
		...defaults,
		id: 'effects-shrinkwrap',
		effectName: 'shrinkwrap',
		effectImportPath: '@remotion/effects/shrinkwrap',
		comp: EffectsShrinkwrapPreview,
		schema: shrinkwrapDemoSchema,
		initialValues: SHRINKWRAP_PREVIEW_PARAMS,
	},
	{
		...defaults,
		id: 'effects-speckle',
		effectName: 'speckle',
		effectImportPath: '@remotion/effects/speckle',
		comp: EffectsSpecklePreview,
		schema: speckle().definition.schema,
	},
	{
		...defaults,
		id: 'effects-mirror',
		effectName: 'mirror',
		effectImportPath: '@remotion/effects/mirror',
		comp: EffectsMirrorPreview,
		schema: mirror().definition.schema,
	},
	{
		...defaults,
		id: 'effects-noise',
		effectName: 'noise',
		effectImportPath: '@remotion/effects/noise',
		comp: EffectsNoisePreview,
		schema: noise().definition.schema,
	},
	{
		...defaults,
		id: 'effects-noise-displacement',
		effectName: 'noiseDisplacement',
		effectImportPath: '@remotion/effects/noise-displacement',
		comp: EffectsNoiseDisplacementPreview,
		schema: noiseDisplacement(NOISE_DISPLACEMENT_PREVIEW_PARAMS).definition
			.schema,
		initialValues: NOISE_DISPLACEMENT_PREVIEW_PARAMS,
	},
	{
		...defaults,
		id: 'effects-white-noise',
		effectName: 'whiteNoise',
		effectImportPath: '@remotion/effects/white-noise',
		comp: EffectsWhiteNoisePreview,
		schema: whiteNoise().definition.schema,
	},
	{
		...defaults,
		id: 'effects-tv-signal-off',
		effectName: 'tvSignalOff',
		effectImportPath: '@remotion/effects/tv-signal-off',
		comp: EffectsTvSignalOffPreview,
		schema: tvSignalOff().definition.schema,
	},
	{
		...defaults,
		id: 'effects-scanlines',
		effectName: 'scanlines',
		effectImportPath: '@remotion/effects/scanlines',
		comp: EffectsScanlinesPreview,
		schema: scanlines().definition.schema,
	},
	{
		...defaults,
		id: 'effects-lines',
		effectName: 'lines',
		effectImportPath: '@remotion/effects/lines',
		comp: EffectsLinesPreview,
		schema: lines().definition.schema,
	},
	{
		...defaults,
		id: 'effects-checkerboard',
		effectName: 'checkerboard',
		effectImportPath: '@remotion/effects/checkerboard',
		comp: EffectsCheckerboardPreview,
		schema: checkerboard().definition.schema,
	},
	{
		...defaults,
		id: 'effects-contour-lines',
		effectName: 'contourLines',
		effectImportPath: '@remotion/effects/contour-lines',
		comp: EffectsContourLinesPreview,
		schema: contourLines().definition.schema,
	},
	{
		...defaults,
		id: 'effects-rings',
		effectName: 'rings',
		effectImportPath: '@remotion/effects/rings',
		comp: EffectsRingsPreview,
		schema: rings().definition.schema,
	},
	{
		...defaults,
		id: 'effects-scale',
		effectName: 'scale',
		effectImportPath: '@remotion/effects/scale',
		comp: EffectsScalePreview,
		schema: scale({scale: 1}).definition.schema,
	},
	{
		...defaults,
		id: 'effects-xy-translate',
		effectName: 'xyTranslate',
		effectImportPath: '@remotion/effects/translate',
		comp: EffectsXyTranslatePreview,
		schema: xyTranslate().definition.schema,
	},
	{
		...defaults,
		id: 'effects-uv-translate',
		effectName: 'uvTranslate',
		effectImportPath: '@remotion/effects/translate',
		comp: EffectsUvTranslatePreview,
		schema: uvTranslate().definition.schema,
	},
	{
		...defaults,
		id: 'effects-barrel-distortion',
		effectName: 'barrelDistortion',
		effectImportPath: '@remotion/effects/barrel-distortion',
		comp: EffectsBarrelDistortionPreview,
		schema: barrelDistortion().definition.schema,
	},
	{
		...defaults,
		id: 'effects-fisheye',
		effectName: 'fisheye',
		effectImportPath: '@remotion/effects/fisheye',
		comp: EffectsFisheyePreview,
		schema: fisheye().definition.schema,
	},
	{
		...defaults,
		id: 'effects-corner-pin',
		effectName: 'cornerPin',
		effectImportPath: '@remotion/effects/corner-pin',
		comp: EffectsCornerPinPreview,
		schema: cornerPin().definition.schema,
	},
	{
		...defaults,
		id: 'effects-vignette',
		effectName: 'vignette',
		effectImportPath: '@remotion/effects/vignette',
		comp: EffectsVignettePreview,
		schema: vignette().definition.schema,
	},
	{
		...defaults,
		id: 'effects-blur',
		effectName: 'blur',
		effectImportPath: '@remotion/effects/blur',
		comp: EffectsBlurPreview,
		schema: blur({radius: 40}).definition.schema,
		initialValues: {
			radius: 40,
		},
	},
	{
		...defaults,
		id: 'effects-linear-progressive-blur',
		effectName: 'linearProgressiveBlur',
		effectImportPath: '@remotion/effects/linear-progressive-blur',
		comp: EffectsLinearProgressiveBlurPreview,
		schema: linearProgressiveBlur().definition.schema,
	},
	{
		...defaults,
		id: 'effects-radial-progressive-blur',
		effectName: 'radialProgressiveBlur',
		effectImportPath: '@remotion/effects/radial-progressive-blur',
		comp: EffectsRadialProgressiveBlurPreview,
		schema: radialProgressiveBlur().definition.schema,
		initialValues: RADIAL_PROGRESSIVE_BLUR_PREVIEW_PARAMS,
	},
	{
		...defaults,
		id: 'effects-light-trail',
		effectName: 'lightTrail',
		effectImportPath: '@remotion/effects/light-trail',
		comp: EffectsLightTrailPreview,
		schema: lightTrail().definition.schema,
		initialValues: LIGHT_TRAIL_PREVIEW_PARAMS,
	},
	{
		...defaults,
		id: 'effects-zoom-blur',
		effectName: 'zoomBlur',
		effectImportPath: '@remotion/effects/zoom-blur',
		comp: EffectsZoomBlurPreview,
		schema: zoomBlur().definition.schema,
	},
	{
		...defaults,
		id: 'effects-chromatic-aberration',
		effectName: 'chromaticAberration',
		effectImportPath: '@remotion/effects/chromatic-aberration',
		comp: EffectsChromaticAberrationPreview,
		schema: chromaticAberration().definition.schema,
	},
	{
		...defaults,
		id: 'effects-wave',
		effectName: 'wave',
		effectImportPath: '@remotion/effects/wave',
		comp: EffectsWavePreview,
		schema: wave().definition.schema,
	},
	{
		...defaults,
		id: 'effects-waves',
		effectName: 'waves',
		effectImportPath: '@remotion/effects/waves',
		comp: EffectsWavesPreview,
		schema: waves().definition.schema,
	},
	{
		...defaults,
		id: 'effects-zigzag',
		effectName: 'zigzag',
		effectImportPath: '@remotion/effects/zigzag',
		comp: EffectsZigzagPreview,
		schema: zigzag().definition.schema,
	},
	{
		...defaults,
		id: 'effects-halftone',
		effectName: 'halftone',
		effectImportPath: '@remotion/effects/halftone',
		comp: EffectsHalftonePreview,
		schema: halftone().definition.schema,
	},
	{
		...defaults,
		id: 'effects-pixelate',
		effectName: 'pixelate',
		effectImportPath: '@remotion/effects/pixelate',
		comp: EffectsPixelatePreview,
		schema: pixelate().definition.schema,
	},
	{
		...defaults,
		id: 'effects-pixel-dissolve',
		effectName: 'pixelDissolve',
		effectImportPath: '@remotion/effects/pixel-dissolve',
		comp: EffectsPixelDissolvePreview,
		schema: pixelDissolve().definition.schema,
	},
	{
		...defaults,
		id: 'effects-pattern',
		effectName: 'pattern',
		effectImportPath: '@remotion/effects/pattern',
		comp: EffectsPatternPreview,
		schema: pattern().definition.schema,
	},
	{
		...defaults,
		id: 'effects-palette-map',
		effectName: 'paletteMap',
		effectImportPath: './palette-map',
		comp: EffectsPaletteMapPreview,
		schema: paletteMap().definition.schema,
	},
	{
		...defaults,
		id: 'effects-halftone-linear-gradient',
		effectName: 'halftoneLinearGradient',
		effectImportPath: '@remotion/effects/halftone-linear-gradient',
		comp: EffectsHalftoneLinearGradientPreview,
		schema: halftoneLinearGradient().definition.schema,
	},
	{
		...defaults,
		id: 'effects-gridlines',
		effectName: 'gridlines',
		effectImportPath: '@remotion/effects/gridlines',
		comp: EffectsGridlinesPreview,
		schema: gridlines().definition.schema,
	},
	{
		...defaults,
		id: 'effects-dot-grid',
		effectName: 'dotGrid',
		effectImportPath: '@remotion/effects/dot-grid',
		comp: EffectsDotGridPreview,
		schema: dotGrid().definition.schema,
	},
	{
		...defaults,
		id: 'effects-starburst',
		effectName: 'starburst',
		effectImportPath: '@remotion/starburst',
		comp: EffectsStarburstPreview,
		schema: starburstEffectSchema,
		initialValues: {
			rays: 16,
			colors: ['#ff6600', '#ffff00'],
		},
	},
	{
		...defaults,
		id: 'effects-light-leak',
		effectName: 'lightLeak',
		effectImportPath: '@remotion/light-leaks',
		comp: EffectsLightLeakPreview,
		schema: lightLeakEffectSchema,
	},
];
