import {experts} from '@remotion/promo-pages/dist/experts/experts-data.js';
import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {Folder, Still} from 'remotion';
import {EffectsBarrelDistortionPreview} from '../../components/effects/effects-barrel-distortion-preview';
import {EffectsBlurPreview} from '../../components/effects/effects-blur-preview';
import {EffectsBrightnessPreview} from '../../components/effects/effects-brightness-preview';
import {EffectsBurlapPreview} from '../../components/effects/effects-burlap-preview';
import {EffectsCheckerboardPreview} from '../../components/effects/effects-checkerboard-preview';
import {EffectsChromaticAberrationPreview} from '../../components/effects/effects-chromatic-aberration-preview';
import {EffectsColorKeyPreview} from '../../components/effects/effects-color-key-preview';
import {EffectsContourLinesPreview} from '../../components/effects/effects-contour-lines-preview';
import {EffectsContrastPreview} from '../../components/effects/effects-contrast-preview';
import {EffectsCornerPinPreview} from '../../components/effects/effects-corner-pin-preview';
import {EffectsDotGridPreview} from '../../components/effects/effects-dot-grid-preview';
import {EffectsDropShadowPreview} from '../../components/effects/effects-drop-shadow-preview';
import {EffectsDuotonePreview} from '../../components/effects/effects-duotone-preview';
import {EffectsEmbossPreview} from '../../components/effects/effects-emboss-preview';
import {EffectsEvolvePreview} from '../../components/effects/effects-evolve-preview';
import {EffectsFisheyePreview} from '../../components/effects/effects-fisheye-preview';
import {EffectsGlowPreview} from '../../components/effects/effects-glow-preview';
import {EffectsGrayscalePreview} from '../../components/effects/effects-grayscale-preview';
import {EffectsGridlinesPreview} from '../../components/effects/effects-gridlines-preview';
import {EffectsHalftoneLinearGradientPreview} from '../../components/effects/effects-halftone-linear-gradient-preview';
import {EffectsHalftonePreview} from '../../components/effects/effects-halftone-preview';
import {EffectsHuePreview} from '../../components/effects/effects-hue-preview';
import {EffectsInvertPreview} from '../../components/effects/effects-invert-preview';
import {EffectsLightLeakPreview} from '../../components/effects/effects-light-leak-preview';
import {
	EffectsLightTrailPreview,
	LIGHT_TRAIL_PREVIEW_PARAMS,
	LightTrailTextSource,
} from '../../components/effects/effects-light-trail-preview';
import {EffectsLinearGradientPreview} from '../../components/effects/effects-linear-gradient-preview';
import {EffectsLinearGradientTintPreview} from '../../components/effects/effects-linear-gradient-tint-preview';
import {EffectsLinearProgressiveBlurPreview} from '../../components/effects/effects-linear-progressive-blur-preview';
import {EffectsLinesPreview} from '../../components/effects/effects-lines-preview';
import {EffectsMirrorPreview} from '../../components/effects/effects-mirror-preview';
import {
	EffectsNoiseDisplacementPreview,
	NOISE_DISPLACEMENT_PREVIEW_PARAMS,
	NoiseDisplacementTextSource,
} from '../../components/effects/effects-noise-displacement-preview';
import {EffectsNoisePreview} from '../../components/effects/effects-noise-preview';
import {EffectsPatternPreview} from '../../components/effects/effects-pattern-preview';
import {EffectsPixelDissolvePreview} from '../../components/effects/effects-pixel-dissolve-preview';
import {EffectsPixelatePreview} from '../../components/effects/effects-pixelate-preview';
import {
	EffectsRadialProgressiveBlurPreview,
	RADIAL_PROGRESSIVE_BLUR_PREVIEW_PARAMS,
} from '../../components/effects/effects-radial-progressive-blur-preview';
import {EffectsRingsPreview} from '../../components/effects/effects-rings-preview';
import {EffectsSaturationPreview} from '../../components/effects/effects-saturation-preview';
import {EffectsScalePreview} from '../../components/effects/effects-scale-preview';
import {EffectsScanlinesPreview} from '../../components/effects/effects-scanlines-preview';
import {EffectsShinePreview} from '../../components/effects/effects-shine-preview';
import {
	EffectsShrinkwrapPreview,
	SHRINKWRAP_PREVIEW_PARAMS,
} from '../../components/effects/effects-shrinkwrap-preview';
import {EffectsSpecklePreview} from '../../components/effects/effects-speckle-preview';
import {EffectsStarburstPreview} from '../../components/effects/effects-starburst-preview';
import {EffectsThermalVisionPreview} from '../../components/effects/effects-thermal-vision-preview';
import {EffectsTintPreview} from '../../components/effects/effects-tint-preview';
import {
	EffectsUvTranslatePreview,
	EffectsXyTranslatePreview,
} from '../../components/effects/effects-translate-preview';
import {EffectsTvSignalOffPreview} from '../../components/effects/effects-tv-signal-off-preview';
import {EffectsVenetianBlindsPreview} from '../../components/effects/effects-venetian-blinds-preview';
import {EffectsVignettePreview} from '../../components/effects/effects-vignette-preview';
import {EffectsWavePreview} from '../../components/effects/effects-wave-preview';
import {EffectsWavesPreview} from '../../components/effects/effects-waves-preview';
import {EffectsWhiteNoisePreview} from '../../components/effects/effects-white-noise-preview';
import {EffectsZigzagPreview} from '../../components/effects/effects-zigzag-preview';
import {EffectsZoomBlurPreview} from '../../components/effects/effects-zoom-blur-preview';
import {articles} from '../data/articles';
import {AllTemplates} from './AllTemplates';
import {Article} from './Article';
import {Expert} from './Expert';
import {TemplateComp} from './Template';

const DEFAULT_EFFECT_COLORS = ['#dff4ff', '#7cc6ff'] as const;
const DEFAULT_THERMAL_PALETTE = [
	'#020617',
	'#1238ff',
	'#00a6ff',
	'#00c853',
	'#d6f542',
	'#ffb000',
	'#ff2f00',
	'#ffffff',
] as const;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="experts">
				{experts.map((e) => {
					return (
						<Still
							key={e.slug}
							component={Expert}
							defaultProps={{
								expertId: e.slug,
							}}
							height={630}
							width={1200}
							id={`experts-${e.slug}`}
						/>
					);
				})}
			</Folder>
			<Folder name="articles">
				{articles.map((e) => {
					return (
						<Still
							key={e.compId}
							component={Article}
							defaultProps={{
								articleRelativePath: e.relativePath,
							}}
							height={630}
							width={1200}
							id={e.compId}
						/>
					);
				})}
			</Folder>
			<Folder name="templates">
				{CreateVideoInternals.FEATURED_TEMPLATES.map((e) => {
					return (
						<Still
							key={e.cliId}
							component={TemplateComp}
							defaultProps={{
								templateId: e.cliId,
							}}
							height={630}
							width={1200}
							id={`template-${e.cliId}`}
						/>
					);
				})}
			</Folder>
			<Folder name="effect-previews">
				<Still
					id="effects-brightness-preview"
					component={EffectsBrightnessPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 0.25}}
				/>
				<Still
					id="effects-burlap-preview"
					component={EffectsBurlapPreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 0.75,
						size: 4,
						roughness: 0.85,
						seed: 1,
						color: '#3b2818',
					}}
				/>
				<Still
					id="effects-emboss-preview"
					component={EffectsEmbossPreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 0.85,
						size: 38,
						lineWidth: 11,
						depth: 0.85,
						angle: 0,
						lightAngle: 135,
						offset: 0,
					}}
				/>
				<Still
					id="effects-contrast-preview"
					component={EffectsContrastPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 1.5}}
				/>
				<Still
					id="effects-color-key-preview"
					component={EffectsColorKeyPreview}
					width={1280}
					height={720}
					defaultProps={{
						keyColor: '#00ff00',
						similarity: 0.45,
						smoothness: 0.08,
						spillSuppression: 0.25,
					}}
				/>
				<Still
					id="effects-duotone-preview"
					component={EffectsDuotonePreview}
					width={1280}
					height={720}
					defaultProps={{
						darkColor: 'black',
						lightColor: 'white',
						threshold: 0.18,
					}}
				/>
				<Still
					id="effects-evolve-preview"
					component={EffectsEvolvePreview}
					width={1280}
					height={720}
					defaultProps={{
						progress: 0.55,
						direction: 'left',
						feather: 0.18,
					}}
				/>
				<Still
					id="effects-venetian-blinds-preview"
					component={EffectsVenetianBlindsPreview}
					width={1280}
					height={720}
					defaultProps={{
						progress: 0.58,
						direction: 'vertical',
						slats: 14,
					}}
				/>
				<Still
					id="effects-drop-shadow-preview"
					component={EffectsDropShadowPreview}
					width={1280}
					height={720}
					defaultProps={{
						radius: 24,
						offsetX: 28,
						offsetY: 28,
						opacity: 0.65,
						color: '#000000',
					}}
				/>
				<Still
					id="effects-glow-preview"
					component={EffectsGlowPreview}
					width={1280}
					height={720}
					defaultProps={{
						radius: 28,
						intensity: 1.8,
						threshold: 0.25,
						color: '#00d8ff',
					}}
				/>
				<Still
					id="effects-grayscale-preview"
					component={EffectsGrayscalePreview}
					width={1280}
					height={720}
					defaultProps={{amount: 1}}
				/>
				<Still
					id="effects-hue-preview"
					component={EffectsHuePreview}
					width={1280}
					height={720}
					defaultProps={{degrees: 120}}
				/>
				<Still
					id="effects-invert-preview"
					component={EffectsInvertPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 1}}
				/>
				<Still
					id="effects-saturation-preview"
					component={EffectsSaturationPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 1.8}}
				/>
				<Still
					id="effects-tint-preview"
					component={EffectsTintPreview}
					width={1280}
					height={720}
					defaultProps={{color: '#1ec8ff', amount: 0.7}}
				/>
				<Still
					id="effects-thermal-vision-preview"
					component={EffectsThermalVisionPreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 1,
						palette: DEFAULT_THERMAL_PALETTE,
					}}
				/>
				<Still
					id="effects-vignette-preview"
					component={EffectsVignettePreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 0.75,
						radius: 0.68,
						feather: 0.35,
						roundness: 1,
						mode: 'color',
						color: '#000000',
						center: [0.5, 0.5],
					}}
				/>
				<Still
					id="effects-mirror-preview"
					component={EffectsMirrorPreview}
					width={1280}
					height={720}
					defaultProps={{direction: 'horizontal', position: 0.5, invert: false}}
				/>
				<Still
					id="effects-scale-preview"
					component={EffectsScalePreview}
					width={1280}
					height={720}
					defaultProps={{scale: 0.8, horizontal: true, vertical: true}}
				/>
				<Still
					id="effects-xy-translate-preview"
					component={EffectsXyTranslatePreview}
					width={1280}
					height={720}
					defaultProps={{x: 180, y: 90}}
				/>
				<Still
					id="effects-uv-translate-preview"
					component={EffectsUvTranslatePreview}
					width={1280}
					height={720}
					defaultProps={{u: 0.15, v: 0.125}}
				/>
				<Still
					id="effects-barrel-distortion-preview"
					component={EffectsBarrelDistortionPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 0.28}}
				/>
				<Still
					id="effects-fisheye-preview"
					component={EffectsFisheyePreview}
					width={1280}
					height={720}
					defaultProps={{
						fieldOfView: 2.5,
						radius: 1.2,
						zoom: 1,
						center: [0.5, 0.5],
					}}
				/>
				<Still
					id="effects-corner-pin-preview"
					component={EffectsCornerPinPreview}
					width={1280}
					height={720}
					defaultProps={{
						topLeft: [0.08, 0.12],
						topRight: [0.92, 0.04],
						bottomRight: [0.86, 0.9],
						bottomLeft: [0.14, 0.96],
					}}
				/>
				<Still
					id="effects-chromatic-aberration-preview"
					component={EffectsChromaticAberrationPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 12, angle: 0}}
				/>
				<Still
					id="effects-blur-preview"
					component={EffectsBlurPreview}
					width={1280}
					height={720}
					defaultProps={{radius: 40, horizontal: true, vertical: true}}
				/>
				<Still
					id="effects-linear-progressive-blur-preview"
					component={EffectsLinearProgressiveBlurPreview}
					width={1280}
					height={720}
					defaultProps={{
						start: [0, 0.5],
						end: [1, 0.5],
						startBlur: 0,
						endBlur: 50,
					}}
				/>
				<Still
					id="effects-linear-gradient-preview"
					component={EffectsLinearGradientPreview}
					width={1280}
					height={720}
					defaultProps={{
						start: [0, 0.5],
						end: [1, 0.5],
						startColor: '#0b84f3',
						endColor: '#ff5c8a',
					}}
				/>
				<Still
					id="effects-linear-gradient-tint-preview"
					component={EffectsLinearGradientTintPreview}
					width={1280}
					height={720}
					defaultProps={{
						start: [0, 0.5],
						end: [1, 0.5],
						startColor: '#0b84f3',
						endColor: '#ff5c8a',
						amount: 0.75,
					}}
				/>
				<Still
					id="effects-radial-progressive-blur-preview"
					component={EffectsRadialProgressiveBlurPreview}
					width={1280}
					height={720}
					defaultProps={RADIAL_PROGRESSIVE_BLUR_PREVIEW_PARAMS}
				/>
				<Still
					id="effects-light-trail-text-source"
					component={LightTrailTextSource}
					width={1920}
					height={1080}
				/>
				<Still
					id="effects-light-trail-preview"
					component={EffectsLightTrailPreview}
					width={1280}
					height={720}
					defaultProps={LIGHT_TRAIL_PREVIEW_PARAMS}
				/>
				<Still
					id="effects-zoom-blur-preview"
					component={EffectsZoomBlurPreview}
					width={1280}
					height={720}
					defaultProps={{amount: 160, center: [0.08, 0.5], samples: 48}}
				/>
				<Still
					id="effects-wave-preview"
					component={EffectsWavePreview}
					width={1280}
					height={720}
					defaultProps={{
						phase: 1.2,
						amplitude: 50,
						wavelength: 200,
						direction: 'horizontal',
					}}
				/>
				<Still
					id="effects-halftone-preview"
					component={EffectsHalftonePreview}
					width={1280}
					height={720}
					defaultProps={{
						shape: 'circle',
						dotSize: 8,
						dotSpacing: 7,
						rotation: 12,
						colorMode: 'solid',
						dotColor: '#0B84F3',
						invert: false,
					}}
				/>
				<Still
					id="effects-pixelate-preview"
					component={EffectsPixelatePreview}
					width={1280}
					height={720}
					defaultProps={{
						blockSize: 10,
					}}
				/>
				<Still
					id="effects-pixel-dissolve-preview"
					component={EffectsPixelDissolvePreview}
					width={1280}
					height={720}
					defaultProps={{
						progress: 0.4,
						columns: 12,
						rows: 12,
						seed: 0,
						feather: 0.15,
					}}
				/>
				<Still
					id="effects-pattern-preview"
					component={EffectsPatternPreview}
					width={1280}
					height={720}
					defaultProps={{
						scale: 0.16,
						cropLeft: 0,
						cropTop: 0,
						cropRight: 0,
						cropBottom: 0,
						gapX: 16,
						gapY: 16,
						offsetU: 0,
						offsetV: 0,
						rowOffset: 88,
						rowOffsetEvery: 0,
						columnOffset: 0,
						columnOffsetEvery: 0,
						origin: [0, 0],
						wrap: true,
					}}
				/>
				<Still
					id="effects-halftone-linear-gradient-preview"
					component={EffectsHalftoneLinearGradientPreview}
					width={1280}
					height={720}
					defaultProps={{
						firstStopDotSize: 0,
						secondStopDotSize: 40,
						firstStopPosition: [0, 0.5],
						secondStopPosition: [1, 0.5],
						gridSize: 24,
						colorMode: 'solid',
						dotColor: '#0b84f3',
					}}
				/>
				<Still
					id="effects-gridlines-preview"
					component={EffectsGridlinesPreview}
					width={1280}
					height={720}
					defaultProps={{
						gridSize: 72,
						lineWidth: 3,
						lineColor: '#ffffff',
						backgroundColor: 'transparent',
						rotation: 0,
						rotationX: 0,
						rotationY: 0,
						perspective: 0,
						offsetX: 0,
						offsetY: 0,
					}}
				/>
				<Still
					id="effects-dot-grid-preview"
					component={EffectsDotGridPreview}
					width={1280}
					height={720}
					defaultProps={{
						dotSize: 16,
						gridSize: 20,
						invert: false,
					}}
				/>
				<Still
					id="effects-noise-preview"
					component={EffectsNoisePreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 0.25,
						seed: 0,
						premultiply: false,
					}}
				/>
				<Still
					id="effects-noise-displacement-text-source"
					component={NoiseDisplacementTextSource}
					width={1920}
					height={1080}
				/>
				<Still
					id="effects-noise-displacement-preview"
					component={EffectsNoiseDisplacementPreview}
					width={1280}
					height={720}
					defaultProps={NOISE_DISPLACEMENT_PREVIEW_PARAMS}
				/>
				<Still
					id="effects-white-noise-preview"
					component={EffectsWhiteNoisePreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 1,
						seed: 0,
					}}
				/>
				<Still
					id="effects-tv-signal-off-preview"
					component={EffectsTvSignalOffPreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 1,
					}}
				/>
				<Still
					id="effects-scanlines-preview"
					component={EffectsScanlinesPreview}
					width={1280}
					height={720}
					defaultProps={{
						amount: 0.6,
						spacing: 8,
						thickness: 2,
						offset: 0,
						premultiply: false,
					}}
				/>
				<Still
					id="effects-lines-preview"
					component={EffectsLinesPreview}
					width={1280}
					height={720}
					defaultProps={{
						colors: DEFAULT_EFFECT_COLORS,
						direction: 'horizontal',
						thickness: 40,
						gap: 0,
						angle: 20,
						offset: 0,
					}}
				/>
				<Still
					id="effects-checkerboard-preview"
					component={EffectsCheckerboardPreview}
					width={1280}
					height={720}
					defaultProps={{
						colors: DEFAULT_EFFECT_COLORS,
						cellSize: 80,
						gap: 0,
						angle: 15,
						offsetX: 0,
						offsetY: 0,
					}}
				/>
				<Still
					id="effects-contour-lines-preview"
					component={EffectsContourLinesPreview}
					width={1280}
					height={720}
					defaultProps={{
						lineColor: '#ffffff',
						lineWidth: 1.1,
						spacing: 36,
						scale: 220,
						complexity: 0.7,
						smoothness: 0.75,
						seed: 2,
						offsetX: 0,
						offsetY: 0,
						opacity: 0.65,
						maskToSourceAlpha: false,
					}}
				/>
				<Still
					id="effects-rings-preview"
					component={EffectsRingsPreview}
					width={1280}
					height={720}
					defaultProps={{
						colors: DEFAULT_EFFECT_COLORS,
						center: [0.5, 0.5],
						thickness: 40,
						gap: 0,
						offset: 0,
					}}
				/>
				<Still
					id="effects-waves-preview"
					component={EffectsWavesPreview}
					width={1280}
					height={720}
					defaultProps={{
						colors: DEFAULT_EFFECT_COLORS,
						direction: 'horizontal',
						thickness: 40,
						gap: 0,
						angle: 0,
						offset: 0,
						amplitude: 24,
						wavelength: 160,
						phase: 45,
					}}
				/>
				<Still
					id="effects-zigzag-preview"
					component={EffectsZigzagPreview}
					width={1280}
					height={720}
					defaultProps={{
						colors: DEFAULT_EFFECT_COLORS,
						direction: 'horizontal',
						thickness: 40,
						gap: 0,
						angle: 0,
						offset: 0,
						amplitude: 40,
						wavelength: 160,
					}}
				/>
				<Still
					id="effects-shine-preview"
					component={EffectsShinePreview}
					width={1280}
					height={720}
					defaultProps={{
						progress: 0.5,
						angle: 30,
						haloSigma: 200,
						coreSigma: 65,
						haloIntensity: 0.3,
						coreIntensity: 0.4,
					}}
				/>
				<Still
					id="effects-shrinkwrap-preview"
					component={EffectsShrinkwrapPreview}
					width={1280}
					height={720}
					defaultProps={SHRINKWRAP_PREVIEW_PARAMS}
				/>
				<Still
					id="effects-speckle-preview"
					component={EffectsSpecklePreview}
					width={1280}
					height={720}
					defaultProps={{density: 0.14, size: 4, randomness: 1}}
				/>
				<Still
					id="effects-starburst-preview"
					component={EffectsStarburstPreview}
					width={1280}
					height={720}
					defaultProps={{
						rays: 16,
						rotation: 0,
						smoothness: 0,
						origin: [0.5, 0.5],
					}}
				/>
				<Still
					id="effects-light-leak-preview"
					component={EffectsLightLeakPreview}
					width={1280}
					height={720}
					defaultProps={{seed: 0, hueShift: 0, progress: 0.5}}
				/>
			</Folder>
			<Still
				component={AllTemplates}
				width={1200}
				height={630}
				id="template-all"
			/>
			{/* <Composition
				component={HomepageVideoComp}
				id="HomepageVideo"
				width={640}
				height={360}
				durationInFrames={120}
				fps={30}
				defaultProps={{
					theme: 'dark',
					cardOrder: [0, 1, 2, 3],
					location: {
						country: 'CH',
						city: 'Zurich',
						longitude: '8.5348',
						latitude: '47.3857',
					},
					trending: {
						repos: [
							'open-mmlab/Amphion',
							'usememos/memos',
							'meta-llama/llama-recipes',
						],
						date: 1730369257379,
						temperatureInCelsius: 11,
						countryLabel: 'Switzerland',
						countryPaths: [
							{
								class: 'CH',
								d: 'M1034.4 197.5l0.2 1.1-0.7 1.5 2.3 1.2 2.6 0.2-0.3 2.5-2.1 1.1-3.8-0.8-1 2.5-2.4 0.2-0.9-1-2.7 2.2-2.5 0.3-2.2-1.4-1.8-2.7-2.4 1 0-2.9 3.6-3.5-0.2-1.6 2.3 0.6 1.3-1.1 4.2 0 1-1.3 5.5 1.9z',
							},
						],
					},
					emojiIndex: 0,
					onClickLeft: () => {},
					onClickRight: () => {},
					onToggle: () => {},
					updateCardOrder: () => {},
				}}
				calculateMetadata={calculateMetadata}
			/> */}
		</>
	);
};
