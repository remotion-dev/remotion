import {expect, test} from 'bun:test';
import {barrelDistortion} from '../barrel-distortion/index.js';
import {blur} from '../blur/index.js';
import {brightness} from '../brightness.js';
import {chromaticAberration} from '../chromatic-aberration/index.js';
import {contrast} from '../contrast.js';
import {dotGrid} from '../dot-grid.js';
import {dropShadow} from '../drop-shadow/index.js';
import {duotone} from '../duotone.js';
import {glow} from '../glow/index.js';
import {grayscale} from '../grayscale.js';
import {halftoneLinearGradient} from '../halftone-linear-gradient.js';
import {halftone} from '../halftone.js';
import {hue} from '../hue.js';
import {invert} from '../invert.js';
import {mirror} from '../mirror.js';
import {noise} from '../noise.js';
import {saturation} from '../saturation.js';
import {scale} from '../scale.js';
import {scanlines} from '../scanlines.js';
import {shine} from '../shine.js';
import {speckle} from '../speckle.js';
import {tint} from '../tint.js';
import {uvTranslate, xyTranslate} from '../translate.js';
import {vignette} from '../vignette.js';
import {wave} from '../wave/index.js';

test('@remotion/effects expose documentation links', () => {
	expect(barrelDistortion().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/barrel-distortion',
	);
	expect(blur({radius: 1}).definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/blur',
	);
	expect(chromaticAberration().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/chromatic-aberration',
	);
	expect(brightness().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/brightness',
	);
	expect(contrast().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/contrast',
	);
	expect(duotone().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/duotone',
	);
	expect(dropShadow().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/drop-shadow',
	);
	expect(glow().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/glow',
	);
	expect(grayscale().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/grayscale',
	);
	expect(halftone().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/halftone',
	);
	expect(halftoneLinearGradient().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/halftone-linear-gradient',
	);
	expect(hue().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/hue',
	);
	expect(invert().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/invert',
	);
	expect(dotGrid().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/dot-grid',
	);
	expect(mirror().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/mirror',
	);
	expect(noise().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/noise',
	);
	expect(saturation().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/saturation',
	);
	expect(scanlines().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/scanlines',
	);
	expect(scale({scale: 1}).definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/scale',
	);
	expect(shine().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/shine',
	);
	expect(speckle().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/speckle',
	);
	expect(tint({color: '#fff'}).definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/tint',
	);
	expect(uvTranslate().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/uv-translate',
	);
	expect(vignette().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/vignette',
	);
	expect(xyTranslate().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/xy-translate',
	);
	expect(wave().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/wave',
	);
});

test('@remotion/effects expose API names as Studio labels', () => {
	expect(barrelDistortion().definition.label).toBe('barrelDistortion()');
	expect(blur({radius: 1}).definition.label).toBe('blur()');
	expect(chromaticAberration().definition.label).toBe('chromaticAberration()');
	expect(brightness().definition.label).toBe('brightness()');
	expect(contrast().definition.label).toBe('contrast()');
	expect(duotone().definition.label).toBe('duotone()');
	expect(dropShadow().definition.label).toBe('dropShadow()');
	expect(grayscale().definition.label).toBe('grayscale()');
	expect(halftone().definition.label).toBe('halftone()');
	expect(halftoneLinearGradient().definition.label).toBe(
		'halftoneLinearGradient()',
	);
	expect(hue().definition.label).toBe('hue()');
	expect(invert().definition.label).toBe('invert()');
	expect(dotGrid().definition.label).toBe('dotGrid()');
	expect(mirror().definition.label).toBe('mirror()');
	expect(noise().definition.label).toBe('noise()');
	expect(saturation().definition.label).toBe('saturation()');
	expect(scanlines().definition.label).toBe('scanlines()');
	expect(scale({scale: 1}).definition.label).toBe('scale()');
	expect(shine().definition.label).toBe('shine()');
	expect(speckle().definition.label).toBe('speckle()');
	expect(tint({color: '#fff'}).definition.label).toBe('tint()');
	expect(uvTranslate().definition.label).toBe('uvTranslate()');
	expect(vignette().definition.label).toBe('vignette()');
	expect(xyTranslate().definition.label).toBe('xyTranslate()');
	expect(wave().definition.label).toBe('wave()');
});

test('barrelDistortion() accepts default params', () => {
	expect(() => barrelDistortion()).not.toThrow();
});

test('barrelDistortion() rejects non-finite amount', () => {
	expect(() => barrelDistortion({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('barrelDistortion() rejects amount below range', () => {
	expect(() => barrelDistortion({amount: -0.1})).toThrow(
		'"amount" must be >= 0',
	);
});

test('barrelDistortion() rejects amount above range', () => {
	expect(() => barrelDistortion({amount: 1.1})).toThrow(
		'"amount" must be <= 1',
	);
});

test('barrelDistortion() amount produces distinct effect keys', () => {
	const none = barrelDistortion({amount: 0});
	const strong = barrelDistortion({amount: 0.5});
	expect(none.effectKey).not.toBe(strong.effectKey);
});

test('chromaticAberration() accepts default params', () => {
	expect(() => chromaticAberration()).not.toThrow();
});

test('chromaticAberration() rejects non-finite amount', () => {
	expect(() => chromaticAberration({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('chromaticAberration() rejects negative amount', () => {
	expect(() => chromaticAberration({amount: -1})).toThrow(
		'"amount" must be >= 0',
	);
});

test('chromaticAberration() rejects non-finite angle', () => {
	expect(() => chromaticAberration({angle: Number.NaN})).toThrow(
		'"angle" must be a finite number',
	);
});

test('chromaticAberration() parameters produce distinct effect keys', () => {
	const none = chromaticAberration({amount: 0});
	const shifted = chromaticAberration({amount: 8});
	const angled = chromaticAberration({amount: 8, angle: 45});

	expect(
		new Set([none.effectKey, shifted.effectKey, angled.effectKey]).size,
	).toBe(3);
});

test('tint() throws when color is not passed', () => {
	expect(() => tint({} as Parameters<typeof tint>[0])).toThrow(
		'"color" must be a non-empty string, but got undefined',
	);
});

test('tint() accepts valid params', () => {
	expect(() => tint({color: '#ff0000'})).not.toThrow();
});

test('tint() rejects non-finite amount', () => {
	expect(() => tint({color: '#ff0000', amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('tint() rejects amount above 1', () => {
	expect(() => tint({color: '#ff0000', amount: 1.5})).toThrow(
		'"amount" must be <= 1',
	);
});

test('tint() rejects amount below 0', () => {
	expect(() => tint({color: '#ff0000', amount: -0.1})).toThrow(
		'"amount" must be >= 0',
	);
});

test('blur() throws when radius is not passed', () => {
	expect(() => blur({} as Parameters<typeof blur>[0])).toThrow(
		'"radius" must be a finite number, but got undefined',
	);
});

test('blur() accepts valid params', () => {
	expect(() => blur({radius: 4})).not.toThrow();
});

test('blur() accepts horizontal-only blur', () => {
	expect(() =>
		blur({radius: 4, horizontal: true, vertical: false}),
	).not.toThrow();
});

test('blur() accepts vertical-only blur', () => {
	expect(() =>
		blur({radius: 4, horizontal: false, vertical: true}),
	).not.toThrow();
});

test('blur() accepts both axes disabled', () => {
	expect(() =>
		blur({radius: 4, horizontal: false, vertical: false}),
	).not.toThrow();
});

test('blur() axis flags produce distinct effect keys', () => {
	const both = blur({radius: 4});
	const horizontalOnly = blur({radius: 4, vertical: false});
	const verticalOnly = blur({radius: 4, horizontal: false});
	const neither = blur({radius: 4, horizontal: false, vertical: false});

	const keys = [
		both.effectKey,
		horizontalOnly.effectKey,
		verticalOnly.effectKey,
		neither.effectKey,
	];
	expect(new Set(keys).size).toBe(keys.length);
});

test('wave() accepts default params', () => {
	expect(() => wave()).not.toThrow();
});

test('wave() rejects invalid direction', () => {
	expect(() => wave({direction: 'diagonal' as 'horizontal'})).toThrow(
		'"direction" must be "horizontal" or "vertical"',
	);
});

test('wave() rejects non-positive wavelength', () => {
	expect(() => wave({wavelength: 0})).toThrow('"wavelength" must be > 0');
});

test('wave() rejects negative amplitude', () => {
	expect(() => wave({amplitude: -1})).toThrow('"amplitude" must be >= 0');
});

test('wave() direction produces distinct effect keys', () => {
	const horizontal = wave({direction: 'horizontal'});
	const vertical = wave({direction: 'vertical'});
	expect(horizontal.effectKey).not.toBe(vertical.effectKey);
});

test('grayscale() accepts default params', () => {
	expect(() => grayscale()).not.toThrow();
});

test('grayscale() rejects non-finite amount', () => {
	expect(() => grayscale({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('grayscale() rejects amount below range', () => {
	expect(() => grayscale({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('grayscale() rejects amount above range', () => {
	expect(() => grayscale({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('grayscale() amount produces distinct effect keys', () => {
	const none = grayscale({amount: 0});
	const full = grayscale({amount: 1});
	expect(none.effectKey).not.toBe(full.effectKey);
});

test('brightness() accepts default params', () => {
	expect(() => brightness()).not.toThrow();
});

test('brightness() rejects non-finite amount', () => {
	expect(() => brightness({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('brightness() rejects amount below range', () => {
	expect(() => brightness({amount: -1.1})).toThrow('"amount" must be >= -1');
});

test('brightness() rejects amount above range', () => {
	expect(() => brightness({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('brightness() amount produces distinct effect keys', () => {
	const darker = brightness({amount: -0.4});
	const neutral = brightness({amount: 0});
	const brighter = brightness({amount: 0.4});
	expect(
		new Set([darker.effectKey, neutral.effectKey, brighter.effectKey]).size,
	).toBe(3);
});

test('contrast() accepts default params', () => {
	expect(() => contrast()).not.toThrow();
});

test('contrast() accepts increased contrast', () => {
	expect(() => contrast({amount: 2})).not.toThrow();
});

test('contrast() rejects non-finite amount', () => {
	expect(() => contrast({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('contrast() rejects amount below range', () => {
	expect(() => contrast({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('contrast() amount produces distinct effect keys', () => {
	const flat = contrast({amount: 0});
	const neutral = contrast({amount: 1});
	const boosted = contrast({amount: 2});
	expect(
		new Set([flat.effectKey, neutral.effectKey, boosted.effectKey]).size,
	).toBe(3);
});

test('duotone() accepts default params', () => {
	expect(() => duotone()).not.toThrow();
});

test('duotone() accepts valid params', () => {
	expect(() =>
		duotone({
			darkColor: '#111111',
			lightColor: '#eeeeee',
			threshold: 0.4,
		}),
	).not.toThrow();
});

test('duotone() rejects empty darkColor strings', () => {
	expect(() => duotone({darkColor: ''})).toThrow(
		'"darkColor" must be a non-empty string, but got ""',
	);
});

test('duotone() rejects empty lightColor strings', () => {
	expect(() => duotone({lightColor: ''})).toThrow(
		'"lightColor" must be a non-empty string, but got ""',
	);
});

test('duotone() rejects non-finite threshold', () => {
	expect(() => duotone({threshold: Number.NaN})).toThrow(
		'"threshold" must be a finite number',
	);
});

test('duotone() rejects threshold below range', () => {
	expect(() => duotone({threshold: -0.1})).toThrow('"threshold" must be >= 0');
});

test('duotone() rejects threshold above range', () => {
	expect(() => duotone({threshold: 1.1})).toThrow('"threshold" must be <= 1');
});

test('duotone() parameters produce distinct effect keys', () => {
	const defaultDuotone = duotone();
	const shiftedThreshold = duotone({threshold: 0.25});
	const customColors = duotone({
		darkColor: '#123456',
		lightColor: '#abcdef',
	});

	expect(
		new Set([
			defaultDuotone.effectKey,
			shiftedThreshold.effectKey,
			customColors.effectKey,
		]).size,
	).toBe(3);
});

test('dropShadow() accepts default params', () => {
	expect(() => dropShadow()).not.toThrow();
});

test('dropShadow() accepts valid params', () => {
	expect(() =>
		dropShadow({
			radius: 24,
			offsetX: -12,
			offsetY: 16,
			opacity: 0.75,
			color: '#112233',
		}),
	).not.toThrow();
});

test('dropShadow() rejects non-finite radius', () => {
	expect(() => dropShadow({radius: Number.NaN})).toThrow(
		'"radius" must be a finite number',
	);
});

test('dropShadow() rejects negative radius', () => {
	expect(() => dropShadow({radius: -1})).toThrow('"radius" must be >= 0');
});

test('dropShadow() rejects non-finite offsetX', () => {
	expect(() => dropShadow({offsetX: Number.NaN})).toThrow(
		'"offsetX" must be a finite number',
	);
});

test('dropShadow() rejects non-finite offsetY', () => {
	expect(() => dropShadow({offsetY: Number.NaN})).toThrow(
		'"offsetY" must be a finite number',
	);
});

test('dropShadow() rejects opacity below range', () => {
	expect(() => dropShadow({opacity: -0.1})).toThrow('"opacity" must be >= 0');
});

test('dropShadow() rejects opacity above range', () => {
	expect(() => dropShadow({opacity: 1.1})).toThrow('"opacity" must be <= 1');
});

test('dropShadow() rejects empty color strings', () => {
	expect(() => dropShadow({color: ''})).toThrow(
		'"color" must be a non-empty string, but got ""',
	);
});

test('dropShadow() parameters produce distinct effect keys', () => {
	const defaultShadow = dropShadow();
	const widerShadow = dropShadow({radius: 24});
	const shiftedX = dropShadow({offsetX: 12});
	const shiftedY = dropShadow({offsetY: 12});
	const transparentShadow = dropShadow({opacity: 0.25});
	const coloredShadow = dropShadow({color: '#112233'});

	expect(
		new Set([
			defaultShadow.effectKey,
			widerShadow.effectKey,
			shiftedX.effectKey,
			shiftedY.effectKey,
			transparentShadow.effectKey,
			coloredShadow.effectKey,
		]).size,
	).toBe(6);
});

test('glow() accepts default params', () => {
	expect(() => glow()).not.toThrow();
});

test('glow() accepts valid params', () => {
	expect(() =>
		glow({
			radius: 30,
			intensity: 1.5,
			threshold: 0.4,
			color: '#00ffff',
		}),
	).not.toThrow();
});

test('glow() rejects non-finite radius', () => {
	expect(() => glow({radius: Number.NaN})).toThrow(
		'"radius" must be a finite number',
	);
});

test('glow() rejects negative radius', () => {
	expect(() => glow({radius: -1})).toThrow('"radius" must be >= 0');
});

test('glow() rejects non-finite intensity', () => {
	expect(() => glow({intensity: Number.NaN})).toThrow(
		'"intensity" must be a finite number',
	);
});

test('glow() rejects negative intensity', () => {
	expect(() => glow({intensity: -0.1})).toThrow('"intensity" must be >= 0');
});

test('glow() rejects threshold below range', () => {
	expect(() => glow({threshold: -0.1})).toThrow('"threshold" must be >= 0');
});

test('glow() rejects threshold above range', () => {
	expect(() => glow({threshold: 1.1})).toThrow('"threshold" must be <= 1');
});

test('glow() rejects empty color strings', () => {
	expect(() => glow({color: ''})).toThrow(
		'"color" must be a non-empty string, but got ""',
	);
});

test('glow() parameters produce distinct effect keys', () => {
	const defaultGlow = glow();
	const widerGlow = glow({radius: 40});
	const strongerGlow = glow({intensity: 2});
	const thresholdGlow = glow({threshold: 0.5});
	const coloredGlow = glow({color: '#00ffff'});

	expect(
		new Set([
			defaultGlow.effectKey,
			widerGlow.effectKey,
			strongerGlow.effectKey,
			thresholdGlow.effectKey,
			coloredGlow.effectKey,
		]).size,
	).toBe(5);
});

test('vignette() accepts default params', () => {
	expect(() => vignette()).not.toThrow();
});

test('vignette() accepts valid color mode params', () => {
	expect(() =>
		vignette({
			amount: 0.8,
			radius: 0.5,
			feather: 0.25,
			roundness: 0.9,
			color: '#221144',
			mode: 'color',
		}),
	).not.toThrow();
});

test('vignette() accepts valid alpha mode params', () => {
	expect(() =>
		vignette({
			amount: 0.8,
			mode: 'alpha',
		}),
	).not.toThrow();
});

test('vignette() rejects non-finite amount', () => {
	expect(() => vignette({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('vignette() rejects radius below range', () => {
	expect(() => vignette({radius: -0.1})).toThrow('"radius" must be >= 0');
});

test('vignette() rejects feather above range', () => {
	expect(() => vignette({feather: 1.1})).toThrow('"feather" must be <= 1');
});

test('vignette() rejects roundness above range', () => {
	expect(() => vignette({roundness: 1.1})).toThrow('"roundness" must be <= 1');
});

test('vignette() rejects empty color strings', () => {
	expect(() => vignette({color: ''})).toThrow(
		'"color" must be a non-empty string, but got ""',
	);
});

test('vignette() rejects mode outside the enum', () => {
	expect(() =>
		vignette({
			mode: 'mask' as Exclude<
				Parameters<typeof vignette>[0],
				undefined
			>['mode'],
		}),
	).toThrow('"mode" must be "color" or "alpha"');
});

test('vignette() parameters produce distinct effect keys', () => {
	const defaultVignette = vignette();
	const strongerVignette = vignette({amount: 0.8});
	const widerVignette = vignette({radius: 0.4});
	const sharperVignette = vignette({feather: 0.1});
	const rectangularVignette = vignette({roundness: 0});
	const coloredVignette = vignette({color: '#0000ff'});
	const alphaVignette = vignette({mode: 'alpha'});

	expect(
		new Set([
			defaultVignette.effectKey,
			strongerVignette.effectKey,
			widerVignette.effectKey,
			sharperVignette.effectKey,
			rectangularVignette.effectKey,
			coloredVignette.effectKey,
			alphaVignette.effectKey,
		]).size,
	).toBe(7);
});

test('halftone() accepts default params', () => {
	expect(() => halftone()).not.toThrow();
});

test('halftone() rejects shape outside the enum', () => {
	expect(() =>
		halftone({
			shape: 'triangle' as Exclude<
				Parameters<typeof halftone>[0],
				undefined
			>['shape'],
		}),
	).toThrow('"shape" must be "circle", "square" or "line"');
});

test('halftone() rejects sampling outside the enum', () => {
	expect(() =>
		halftone({
			sampling: 'cubic' as Exclude<
				Parameters<typeof halftone>[0],
				undefined
			>['sampling'],
		}),
	).toThrow('"sampling" must be "bilinear" or "nearest"');
});

test('halftone() rejects dotSize below range', () => {
	expect(() => halftone({dotSize: 0})).toThrow('"dotSize" must be >= 1');
});

test('halftone() rejects empty dotColor strings', () => {
	expect(() => halftone({dotColor: ''})).toThrow(
		'"dotColor" must be a non-empty string, but got ""',
	);
});

test('halftone() rejects color outside the enum', () => {
	expect(() =>
		halftone({
			colorMode: 'cmyk' as Exclude<
				Parameters<typeof halftone>[0],
				undefined
			>['colorMode'],
		}),
	).toThrow('"colorMode" must be "solid" or "source"');
});

test('halftone() rejects the renamed color option', () => {
	expect(() =>
		halftone({
			color: 'black',
		} as Parameters<typeof halftone>[0]),
	).toThrow('"color" has been renamed to "dotColor"');
});

test('halftone() ignores undefined legacy color option', () => {
	expect(() =>
		halftone({
			color: undefined,
		} as Parameters<typeof halftone>[0]),
	).not.toThrow();
});

test('halftone() rejects dotColor for source color mode', () => {
	expect(() =>
		halftone({
			colorMode: 'source',
			dotColor: 'black',
		} as Parameters<typeof halftone>[0]),
	).toThrow('"dotColor" can only be set when "colorMode" is "solid"');
});

test('halftoneLinearGradient() accepts default params', () => {
	expect(() => halftoneLinearGradient()).not.toThrow();
});

test('halftoneLinearGradient() rejects first stop dot size below range', () => {
	expect(() => halftoneLinearGradient({firstStopDotSize: -1})).toThrow(
		'"firstStopDotSize" must be >= 0',
	);
});

test('halftoneLinearGradient() rejects second stop dot size below range', () => {
	expect(() => halftoneLinearGradient({secondStopDotSize: -1})).toThrow(
		'"secondStopDotSize" must be >= 0',
	);
});

test('halftoneLinearGradient() rejects first stop position outside the tuple shape', () => {
	expect(() =>
		halftoneLinearGradient({
			firstStopPosition: [0, 0.5, 1] as unknown as [number, number],
		}),
	).toThrow('"firstStopPosition" must be a [number, number] tuple');
});

test('halftoneLinearGradient() rejects second stop position outside the tuple shape', () => {
	expect(() =>
		halftoneLinearGradient({
			secondStopPosition: [0, Number.NaN],
		}),
	).toThrow('"secondStopPosition" must be a [number, number] tuple');
});

test('halftoneLinearGradient() rejects non-positive grid size', () => {
	expect(() => halftoneLinearGradient({gridSize: 0})).toThrow(
		'"gridSize" must be greater than 0',
	);
});

test('halftoneLinearGradient() rejects color outside the enum', () => {
	expect(() =>
		halftoneLinearGradient({
			colorMode: 'cmyk' as Exclude<
				Parameters<typeof halftoneLinearGradient>[0],
				undefined
			>['colorMode'],
		}),
	).toThrow('"colorMode" must be "solid" or "source"');
});

test('halftoneLinearGradient() rejects empty dotColor strings', () => {
	expect(() => halftoneLinearGradient({dotColor: ''})).toThrow(
		'"dotColor" must be a non-empty string, but got ""',
	);
});

test('halftoneLinearGradient() rejects dotColor for source color mode', () => {
	expect(() =>
		halftoneLinearGradient({
			colorMode: 'source',
			dotColor: 'black',
		} as Parameters<typeof halftoneLinearGradient>[0]),
	).toThrow('"dotColor" can only be set when "colorMode" is "solid"');
});

test('halftoneLinearGradient() parameters produce distinct effect keys', () => {
	const defaultGradient = halftoneLinearGradient();
	const shiftedFirstStop = halftoneLinearGradient({firstStopDotSize: 8});
	const shiftedSecondStop = halftoneLinearGradient({secondStopDotSize: 20});
	const shiftedFirstPosition = halftoneLinearGradient({
		firstStopPosition: [0.2, 0.5],
	});
	const sourceColor = halftoneLinearGradient({colorMode: 'source'});

	expect(
		new Set([
			defaultGradient.effectKey,
			shiftedFirstStop.effectKey,
			shiftedSecondStop.effectKey,
			shiftedFirstPosition.effectKey,
			sourceColor.effectKey,
		]).size,
	).toBe(5);
});

test('dotGrid() accepts default params', () => {
	expect(() => dotGrid()).not.toThrow();
});

test('dotGrid() rejects non-finite dot size', () => {
	expect(() => dotGrid({dotSize: Number.NaN})).toThrow(
		'"dotSize" must be a finite number',
	);
});

test('dotGrid() rejects dot size below range', () => {
	expect(() => dotGrid({dotSize: -1})).toThrow('"dotSize" must be >= 0');
});

test('dotGrid() rejects non-positive grid size', () => {
	expect(() => dotGrid({gridSize: 0})).toThrow(
		'"gridSize" must be greater than 0',
	);
});

test('dotGrid() rejects non-boolean invert', () => {
	expect(() => dotGrid({invert: 'yes' as unknown as boolean})).toThrow(
		'"invert" must be a boolean',
	);
});

test('dotGrid() parameters produce distinct effect keys', () => {
	const defaultGrid = dotGrid();
	const largerDots = dotGrid({dotSize: 24});
	const widerGrid = dotGrid({gridSize: 32});
	const inverted = dotGrid({invert: true});

	expect(
		new Set([
			defaultGrid.effectKey,
			largerDots.effectKey,
			widerGrid.effectKey,
			inverted.effectKey,
		]).size,
	).toBe(4);
});

test('invert() accepts default params', () => {
	expect(() => invert()).not.toThrow();
});

test('invert() rejects non-finite amount', () => {
	expect(() => invert({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('invert() rejects amount below range', () => {
	expect(() => invert({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('invert() rejects amount above range', () => {
	expect(() => invert({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('invert() amount produces distinct effect keys', () => {
	const none = invert({amount: 0});
	const full = invert({amount: 1});
	expect(none.effectKey).not.toBe(full.effectKey);
});

test('mirror() accepts default params', () => {
	expect(() => mirror()).not.toThrow();
});

test('mirror() rejects invalid direction', () => {
	expect(() => mirror({direction: 'diagonal' as 'horizontal'})).toThrow(
		'"direction" must be "horizontal" or "vertical"',
	);
});

test('mirror() rejects non-finite position', () => {
	expect(() => mirror({position: Number.NaN})).toThrow(
		'"position" must be a finite number',
	);
});

test('mirror() rejects position below range', () => {
	expect(() => mirror({position: -0.1})).toThrow('"position" must be >= 0');
});

test('mirror() rejects position above range', () => {
	expect(() => mirror({position: 1.1})).toThrow('"position" must be <= 1');
});

test('mirror() rejects non-boolean invert', () => {
	expect(() => mirror({invert: 'yes' as unknown as boolean})).toThrow(
		'"invert" must be a boolean',
	);
});

test('mirror() parameters produce distinct effect keys', () => {
	const horizontal = mirror({direction: 'horizontal'});
	const vertical = mirror({direction: 'vertical'});
	const shifted = mirror({position: 0.25});
	const inverted = mirror({invert: true});

	expect(
		new Set([
			horizontal.effectKey,
			vertical.effectKey,
			shifted.effectKey,
			inverted.effectKey,
		]).size,
	).toBe(4);
});

test('noise() accepts default params', () => {
	expect(() => noise()).not.toThrow();
});

test('noise() rejects non-finite amount', () => {
	expect(() => noise({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('noise() rejects amount below range', () => {
	expect(() => noise({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('noise() rejects amount above range', () => {
	expect(() => noise({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('noise() rejects non-finite seed', () => {
	expect(() => noise({seed: Number.NaN})).toThrow(
		'"seed" must be a finite number',
	);
});

test('noise() rejects non-boolean premultiply', () => {
	expect(() => noise({premultiply: 'yes' as unknown as boolean})).toThrow(
		'"premultiply" must be a boolean',
	);
});

test('noise() parameters produce distinct effect keys', () => {
	const subtle = noise({amount: 0.1});
	const strong = noise({amount: 0.3});
	const seeded = noise({amount: 0.3, seed: 1});
	const premultiplied = noise({amount: 0.3, premultiply: true});

	expect(
		new Set([
			subtle.effectKey,
			strong.effectKey,
			seeded.effectKey,
			premultiplied.effectKey,
		]).size,
	).toBe(4);
});

test('saturation() accepts default params', () => {
	expect(() => saturation()).not.toThrow();
});

test('saturation() accepts oversaturation', () => {
	expect(() => saturation({amount: 2})).not.toThrow();
});

test('saturation() rejects non-finite amount', () => {
	expect(() => saturation({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('saturation() rejects amount below range', () => {
	expect(() => saturation({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('saturation() amount produces distinct effect keys', () => {
	const desaturated = saturation({amount: 0});
	const neutral = saturation({amount: 1});
	const oversaturated = saturation({amount: 2});
	expect(
		new Set([desaturated.effectKey, neutral.effectKey, oversaturated.effectKey])
			.size,
	).toBe(3);
});

test('scanlines() accepts default params', () => {
	expect(() => scanlines()).not.toThrow();
});

test('scanlines() rejects non-finite amount', () => {
	expect(() => scanlines({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('scanlines() rejects amount below range', () => {
	expect(() => scanlines({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('scanlines() rejects amount above range', () => {
	expect(() => scanlines({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('scanlines() rejects non-finite spacing', () => {
	expect(() => scanlines({spacing: Number.NaN})).toThrow(
		'"spacing" must be a finite number',
	);
});

test('scanlines() rejects non-positive spacing', () => {
	expect(() => scanlines({spacing: 0})).toThrow(
		'"spacing" must be greater than 0',
	);
});

test('scanlines() rejects negative thickness', () => {
	expect(() => scanlines({thickness: -1})).toThrow('"thickness" must be >= 0');
});

test('scanlines() rejects non-finite offset', () => {
	expect(() => scanlines({offset: Number.NaN})).toThrow(
		'"offset" must be a finite number',
	);
});

test('scanlines() rejects non-boolean premultiply', () => {
	expect(() => scanlines({premultiply: 'yes' as unknown as boolean})).toThrow(
		'"premultiply" must be a boolean',
	);
});

test('scanlines() parameters produce distinct effect keys', () => {
	const subtle = scanlines({amount: 0.1});
	const strong = scanlines({amount: 0.3});
	const dense = scanlines({spacing: 2});
	const thick = scanlines({thickness: 2});
	const shifted = scanlines({offset: 1});
	const premultiplied = scanlines({premultiply: true});

	expect(
		new Set([
			subtle.effectKey,
			strong.effectKey,
			dense.effectKey,
			thick.effectKey,
			shifted.effectKey,
			premultiplied.effectKey,
		]).size,
	).toBe(6);
});

test('hue() accepts default params', () => {
	expect(() => hue()).not.toThrow();
});

test('hue() rejects non-finite degrees', () => {
	expect(() => hue({degrees: Number.NaN})).toThrow(
		'"degrees" must be a finite number',
	);
});

test('hue() degrees produces distinct effect keys', () => {
	const noRotation = hue({degrees: 0});
	const rotated = hue({degrees: 90});
	expect(noRotation.effectKey).not.toBe(rotated.effectKey);
});

test('scale() throws when scale is not passed', () => {
	expect(() => scale({} as Parameters<typeof scale>[0])).toThrow(
		'"scale" must be a finite number, but got undefined',
	);
});

test('scale() accepts valid params', () => {
	expect(() => scale({scale: 1.5})).not.toThrow();
});

test('scale() accepts horizontal-only scaling', () => {
	expect(() =>
		scale({scale: 1.5, horizontal: true, vertical: false}),
	).not.toThrow();
});

test('scale() accepts vertical-only scaling', () => {
	expect(() =>
		scale({scale: 1.5, horizontal: false, vertical: true}),
	).not.toThrow();
});

test('scale() accepts both axes disabled', () => {
	expect(() =>
		scale({scale: 1.5, horizontal: false, vertical: false}),
	).not.toThrow();
});

test('scale() rejects non-positive scale', () => {
	expect(() => scale({scale: 0})).toThrow('"scale" must be greater than 0');
});

test('scale() axis flags produce distinct effect keys', () => {
	const both = scale({scale: 1.5});
	const horizontalOnly = scale({scale: 1.5, vertical: false});
	const verticalOnly = scale({scale: 1.5, horizontal: false});
	const neither = scale({scale: 1.5, horizontal: false, vertical: false});

	const keys = [
		both.effectKey,
		horizontalOnly.effectKey,
		verticalOnly.effectKey,
		neither.effectKey,
	];
	expect(new Set(keys).size).toBe(keys.length);
});

test('shine() accepts default params', () => {
	expect(() => shine()).not.toThrow();
});

test('shine() accepts valid params', () => {
	expect(() =>
		shine({
			progress: 0.25,
			angle: 45,
			haloSigma: 160,
			coreSigma: 48,
			haloIntensity: 0.4,
			coreIntensity: 0.6,
		}),
	).not.toThrow();
});

test('shine() rejects progress below range', () => {
	expect(() => shine({progress: -0.1})).toThrow('"progress" must be >= 0');
});

test('shine() rejects progress above range', () => {
	expect(() => shine({progress: 1.1})).toThrow('"progress" must be <= 1');
});

test('shine() rejects non-positive haloSigma', () => {
	expect(() => shine({haloSigma: 0})).toThrow(
		'"haloSigma" must be greater than 0',
	);
});

test('shine() rejects non-positive coreSigma', () => {
	expect(() => shine({coreSigma: 0})).toThrow(
		'"coreSigma" must be greater than 0',
	);
});

test('shine() rejects haloIntensity above range', () => {
	expect(() => shine({haloIntensity: 1.1})).toThrow(
		'"haloIntensity" must be <= 1',
	);
});

test('shine() rejects coreIntensity below range', () => {
	expect(() => shine({coreIntensity: -0.1})).toThrow(
		'"coreIntensity" must be >= 0',
	);
});

test('shine() parameters produce distinct effect keys', () => {
	const defaultShine = shine();
	const advanced = shine({progress: 0.75});
	const angled = shine({angle: 75});
	const wider = shine({haloSigma: 250});
	const sharper = shine({coreSigma: 40});
	const brighter = shine({coreIntensity: 0.8});

	expect(
		new Set([
			defaultShine.effectKey,
			advanced.effectKey,
			angled.effectKey,
			wider.effectKey,
			sharper.effectKey,
			brighter.effectKey,
		]).size,
	).toBe(6);
});

test('speckle() accepts default params', () => {
	expect(() => speckle()).not.toThrow();
});

test('speckle() accepts valid params', () => {
	expect(() =>
		speckle({
			density: 0.2,
			size: 6,
			randomness: 0.5,
		}),
	).not.toThrow();
});

test('speckle() rejects non-finite density', () => {
	expect(() => speckle({density: Number.NaN})).toThrow(
		'"density" must be a finite number',
	);
});

test('speckle() rejects density above range', () => {
	expect(() => speckle({density: 1.1})).toThrow('"density" must be <= 1');
});

test('speckle() rejects negative size', () => {
	expect(() => speckle({size: -0.1})).toThrow('"size" must be >= 0');
});

test('speckle() rejects randomness below range', () => {
	expect(() => speckle({randomness: -0.1})).toThrow(
		'"randomness" must be >= 0',
	);
});

test('speckle() parameters produce distinct effect keys', () => {
	const defaultSpeckle = speckle();
	const denser = speckle({density: 0.2});
	const larger = speckle({size: 8});
	const steadier = speckle({randomness: 0.25});

	expect(
		new Set([
			defaultSpeckle.effectKey,
			denser.effectKey,
			larger.effectKey,
			steadier.effectKey,
		]).size,
	).toBe(4);
});

test('xyTranslate() accepts default params', () => {
	expect(() => xyTranslate()).not.toThrow();
});

test('xyTranslate() rejects non-finite offsets', () => {
	expect(() => xyTranslate({x: Number.NaN})).toThrow(
		'"x" must be a finite number',
	);
	expect(() => xyTranslate({y: Number.NaN})).toThrow(
		'"y" must be a finite number',
	);
});

test('xyTranslate() offsets produce distinct effect keys', () => {
	const centered = xyTranslate();
	const shiftedX = xyTranslate({x: 10});
	const shiftedY = xyTranslate({y: 10});

	expect(
		new Set([centered.effectKey, shiftedX.effectKey, shiftedY.effectKey]).size,
	).toBe(3);
});

test('uvTranslate() accepts default params', () => {
	expect(() => uvTranslate()).not.toThrow();
});

test('uvTranslate() rejects non-finite offsets', () => {
	expect(() => uvTranslate({u: Number.NaN})).toThrow(
		'"u" must be a finite number',
	);
	expect(() => uvTranslate({v: Number.NaN})).toThrow(
		'"v" must be a finite number',
	);
});

test('uvTranslate() offsets produce distinct effect keys', () => {
	const centered = uvTranslate();
	const shiftedU = uvTranslate({u: 0.1});
	const shiftedV = uvTranslate({v: 0.1});

	expect(
		new Set([centered.effectKey, shiftedU.effectKey, shiftedV.effectKey]).size,
	).toBe(3);
});
