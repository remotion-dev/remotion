import {barrelDistortion} from '@remotion/effects/barrel-distortion';
import {blur} from '@remotion/effects/blur';
import {brightness} from '@remotion/effects/brightness';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {contrast} from '@remotion/effects/contrast';
import {dotGrid} from '@remotion/effects/dot-grid';
import {dropShadow} from '@remotion/effects/drop-shadow';
import {duotone} from '@remotion/effects/duotone';
import {evolve} from '@remotion/effects/evolve';
import {fisheye} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {grayscale} from '@remotion/effects/grayscale';
import {halftone} from '@remotion/effects/halftone';
import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import {hue} from '@remotion/effects/hue';
import {invert} from '@remotion/effects/invert';
import {lines} from '@remotion/effects/lines';
import {mirror} from '@remotion/effects/mirror';
import {noise} from '@remotion/effects/noise';
import {saturation} from '@remotion/effects/saturation';
import {scale} from '@remotion/effects/scale';
import {scanlines} from '@remotion/effects/scanlines';
import {shine} from '@remotion/effects/shine';
import {speckle} from '@remotion/effects/speckle';
import {tint} from '@remotion/effects/tint';
import {uvTranslate, xyTranslate} from '@remotion/effects/translate';
import {vignette} from '@remotion/effects/vignette';
import {wave} from '@remotion/effects/wave';
import {waves} from '@remotion/effects/waves';
import {whiteNoise} from '@remotion/effects/white-noise';
import {lightLeakEffectSchema} from '@remotion/light-leaks';
import {starburstEffectSchema} from '@remotion/starburst';
import {EffectsBarrelDistortionPreview} from '../effects/effects-barrel-distortion-preview';
import {EffectsBlurPreview} from '../effects/effects-blur-preview';
import {EffectsBrightnessPreview} from '../effects/effects-brightness-preview';
import {EffectsChromaticAberrationPreview} from '../effects/effects-chromatic-aberration-preview';
import {EffectsContrastPreview} from '../effects/effects-contrast-preview';
import {EffectsDotGridPreview} from '../effects/effects-dot-grid-preview';
import {EffectsDropShadowPreview} from '../effects/effects-drop-shadow-preview';
import {EffectsDuotonePreview} from '../effects/effects-duotone-preview';
import {EffectsEvolvePreview} from '../effects/effects-evolve-preview';
import {EffectsFisheyePreview} from '../effects/effects-fisheye-preview';
import {EffectsGlowPreview} from '../effects/effects-glow-preview';
import {EffectsGrayscalePreview} from '../effects/effects-grayscale-preview';
import {EffectsHalftoneLinearGradientPreview} from '../effects/effects-halftone-linear-gradient-preview';
import {EffectsHalftonePreview} from '../effects/effects-halftone-preview';
import {EffectsHuePreview} from '../effects/effects-hue-preview';
import {EffectsInvertPreview} from '../effects/effects-invert-preview';
import {EffectsLightLeakPreview} from '../effects/effects-light-leak-preview';
import {EffectsLinesPreview} from '../effects/effects-lines-preview';
import {EffectsMirrorPreview} from '../effects/effects-mirror-preview';
import {EffectsNoisePreview} from '../effects/effects-noise-preview';
import {EffectsSaturationPreview} from '../effects/effects-saturation-preview';
import {EffectsScalePreview} from '../effects/effects-scale-preview';
import {EffectsScanlinesPreview} from '../effects/effects-scanlines-preview';
import {EffectsShinePreview} from '../effects/effects-shine-preview';
import {EffectsSpecklePreview} from '../effects/effects-speckle-preview';
import {EffectsStarburstPreview} from '../effects/effects-starburst-preview';
import {EffectsTintPreview} from '../effects/effects-tint-preview';
import {
	EffectsUvTranslatePreview,
	EffectsXyTranslatePreview,
} from '../effects/effects-translate-preview';
import {EffectsVignettePreview} from '../effects/effects-vignette-preview';
import {EffectsWavePreview} from '../effects/effects-wave-preview';
import {EffectsWavesPreview} from '../effects/effects-waves-preview';
import {EffectsWhiteNoisePreview} from '../effects/effects-white-noise-preview';
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
		id: 'effects-contrast',
		effectName: 'contrast',
		effectImportPath: '@remotion/effects/contrast',
		comp: EffectsContrastPreview,
		schema: contrast().definition.schema,
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
		id: 'effects-shine',
		effectName: 'shine',
		effectImportPath: '@remotion/effects/shine',
		comp: EffectsShinePreview,
		schema: shine().definition.schema,
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
		id: 'effects-white-noise',
		effectName: 'whiteNoise',
		effectImportPath: '@remotion/effects/white-noise',
		comp: EffectsWhiteNoisePreview,
		schema: whiteNoise().definition.schema,
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
		id: 'effects-halftone',
		effectName: 'halftone',
		effectImportPath: '@remotion/effects/halftone',
		comp: EffectsHalftonePreview,
		schema: halftone().definition.schema,
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
