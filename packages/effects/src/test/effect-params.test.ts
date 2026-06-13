import {expect, test} from 'bun:test';
import {barrelDistortion} from '../barrel-distortion/index.js';
import {blur} from '../blur/index.js';
import {brightness} from '../brightness.js';
import {chromaticAberration} from '../chromatic-aberration/index.js';
import {colorKey} from '../color-key.js';
import {contrast} from '../contrast.js';
import {dotGrid} from '../dot-grid.js';
import {dropShadow} from '../drop-shadow/index.js';
import {duotone} from '../duotone.js';
import {evolve} from '../evolve.js';
import {fisheye} from '../fisheye/index.js';
import {glow} from '../glow/index.js';
import {grayscale} from '../grayscale.js';
import {halftoneLinearGradient} from '../halftone-linear-gradient.js';
import {halftone} from '../halftone.js';
import {hue} from '../hue.js';
import {invert} from '../invert.js';
import {linearProgressiveBlur} from '../linear-progressive-blur/index.js';
import {lines} from '../lines.js';
import {mirror} from '../mirror.js';
import {
	noiseDisplacement,
	type NoiseDisplacementParams,
} from '../noise-displacement.js';
import {noise} from '../noise.js';
import {pixelDissolve} from '../pixel-dissolve.js';
import {rings} from '../rings.js';
import {saturation} from '../saturation.js';
import {scale} from '../scale.js';
import {scanlines} from '../scanlines.js';
import {shine} from '../shine.js';
import {speckle} from '../speckle.js';
import {tint} from '../tint.js';
import {uvTranslate, xyTranslate} from '../translate.js';
import {tvSignalOff} from '../tv-signal-off.js';
import {publicUvToShaderUv} from '../uv-coordinate.js';
import {vignette} from '../vignette.js';
import {wave} from '../wave/index.js';
import {waves} from '../waves.js';
import {whiteNoise} from '../white-noise.js';
import {zigzag} from '../zigzag.js';

const expectDefaultBlueColorArrayControl = (schema: {
	readonly colors?: unknown;
}): void => {
	expect(schema.colors).toEqual({
		type: 'array',
		item: {
			type: 'color',
		},
		default: ['#dff4ff', '#7cc6ff'],
		minLength: 2,
		newItemDefault: '#ff0000',
		description: 'Colors',
		keyframable: false,
	});
};

test('public UV coordinates convert to shader UV coordinates', () => {
	expect(publicUvToShaderUv([0, 0])).toEqual([0, 1]);
	expect(publicUvToShaderUv([0.25, 0.75])).toEqual([0.25, 0.25]);
});

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
	expect(colorKey().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/color-key',
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
	expect(evolve().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/evolve',
	);
	expect(dropShadow().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/drop-shadow',
	);
	expect(fisheye().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/fisheye',
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
	expect(pixelDissolve().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/pixel-dissolve',
	);
	expect(hue().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/hue',
	);
	expect(invert().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/invert',
	);
	expect(lines().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/lines',
	);
	expect(linearProgressiveBlur().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/linear-progressive-blur',
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
	expect(
		noiseDisplacement({center: [0.5, 0.5], radius: 0.25}).definition
			.documentationLink,
	).toBe('https://www.remotion.dev/docs/effects/noise-displacement');
	expect(rings().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/rings',
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
	expect(tvSignalOff().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/tv-signal-off',
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
	expect(waves().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/waves',
	);
	expect(zigzag().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/zigzag',
	);
	expect(whiteNoise().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/white-noise',
	);
});

test('@remotion/effects expose API names as Studio labels', () => {
	expect(barrelDistortion().definition.label).toBe('barrelDistortion()');
	expect(blur({radius: 1}).definition.label).toBe('blur()');
	expect(chromaticAberration().definition.label).toBe('chromaticAberration()');
	expect(colorKey().definition.label).toBe('colorKey()');
	expect(brightness().definition.label).toBe('brightness()');
	expect(contrast().definition.label).toBe('contrast()');
	expect(duotone().definition.label).toBe('duotone()');
	expect(evolve().definition.label).toBe('evolve()');
	expect(dropShadow().definition.label).toBe('dropShadow()');
	expect(fisheye().definition.label).toBe('fisheye()');
	expect(glow().definition.label).toBe('glow()');
	expect(grayscale().definition.label).toBe('grayscale()');
	expect(halftone().definition.label).toBe('halftone()');
	expect(halftoneLinearGradient().definition.label).toBe(
		'halftoneLinearGradient()',
	);
	expect(pixelDissolve().definition.label).toBe('pixelDissolve()');
	expect(hue().definition.label).toBe('hue()');
	expect(invert().definition.label).toBe('invert()');
	expect(lines().definition.label).toBe('lines()');
	expect(linearProgressiveBlur().definition.label).toBe(
		'linearProgressiveBlur()',
	);
	expect(dotGrid().definition.label).toBe('dotGrid()');
	expect(mirror().definition.label).toBe('mirror()');
	expect(noise().definition.label).toBe('noise()');
	expect(
		noiseDisplacement({center: [0.5, 0.5], radius: 0.25}).definition.label,
	).toBe('noiseDisplacement()');
	expect(rings().definition.label).toBe('rings()');
	expect(saturation().definition.label).toBe('saturation()');
	expect(scanlines().definition.label).toBe('scanlines()');
	expect(scale({scale: 1}).definition.label).toBe('scale()');
	expect(shine().definition.label).toBe('shine()');
	expect(speckle().definition.label).toBe('speckle()');
	expect(tint({color: '#fff'}).definition.label).toBe('tint()');
	expect(tvSignalOff().definition.label).toBe('tvSignalOff()');
	expect(uvTranslate().definition.label).toBe('uvTranslate()');
	expect(vignette().definition.label).toBe('vignette()');
	expect(xyTranslate().definition.label).toBe('xyTranslate()');
	expect(wave().definition.label).toBe('wave()');
	expect(waves().definition.label).toBe('waves()');
	expect(zigzag().definition.label).toBe('zigzag()');
	expect(whiteNoise().definition.label).toBe('whiteNoise()');
});

test('@remotion/effects palette effects expose colors as array controls', () => {
	expectDefaultBlueColorArrayControl(lines().definition.schema);
	expectDefaultBlueColorArrayControl(rings().definition.schema);
	expectDefaultBlueColorArrayControl(waves().definition.schema);
	expectDefaultBlueColorArrayControl(zigzag().definition.schema);
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

test('fisheye() accepts default params', () => {
	expect(() => fisheye()).not.toThrow();
});

test('fisheye() rejects non-finite fieldOfView', () => {
	expect(() => fisheye({fieldOfView: Number.NaN})).toThrow(
		'"fieldOfView" must be a finite number',
	);
});

test('fisheye() rejects negative fieldOfView', () => {
	expect(() => fisheye({fieldOfView: -0.1})).toThrow(
		'"fieldOfView" must be >= 0',
	);
});

test('fisheye() rejects fieldOfView above range', () => {
	expect(() => fisheye({fieldOfView: Math.PI + 0.1})).toThrow(
		'"fieldOfView" must be <=',
	);
});

test('fisheye() rejects non-positive radius', () => {
	expect(() => fisheye({radius: 0})).toThrow('"radius" must be greater than 0');
});

test('fisheye() rejects non-positive zoom', () => {
	expect(() => fisheye({zoom: 0})).toThrow('"zoom" must be greater than 0');
});

test('fisheye() rejects invalid center', () => {
	const invalidCenter = [0.5] as unknown as [number, number];
	expect(() => fisheye({center: invalidCenter})).toThrow(
		'"center" must be a [number, number] tuple',
	);
});

test('fisheye() params produce distinct effect keys', () => {
	const a = fisheye({fieldOfView: 1.0});
	const b = fisheye({fieldOfView: 2.0});
	const c = fisheye({fieldOfView: 1.0, zoom: 1.5});
	const d = fisheye({fieldOfView: 1.0, center: [0.3, 0.7]});
	const e = fisheye({fieldOfView: 1.0, radius: 0.5});
	expect(a.effectKey).not.toBe(b.effectKey);
	expect(a.effectKey).not.toBe(c.effectKey);
	expect(a.effectKey).not.toBe(d.effectKey);
	expect(a.effectKey).not.toBe(e.effectKey);
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

test('colorKey() accepts default params', () => {
	expect(() => colorKey()).not.toThrow();
});

test('colorKey() rejects empty keyColor strings', () => {
	expect(() => colorKey({keyColor: ''})).toThrow(
		'"keyColor" must be a non-empty string, but got ""',
	);
});

test('colorKey() rejects non-finite similarity', () => {
	expect(() => colorKey({similarity: Number.NaN})).toThrow(
		'"similarity" must be a finite number',
	);
});

test('colorKey() rejects similarity below range', () => {
	expect(() => colorKey({similarity: -0.1})).toThrow(
		'"similarity" must be >= 0',
	);
});

test('colorKey() rejects similarity above range', () => {
	expect(() => colorKey({similarity: 1.1})).toThrow(
		'"similarity" must be <= 1',
	);
});

test('colorKey() rejects non-finite smoothness', () => {
	expect(() => colorKey({smoothness: Number.NaN})).toThrow(
		'"smoothness" must be a finite number',
	);
});

test('colorKey() rejects smoothness below range', () => {
	expect(() => colorKey({smoothness: -0.1})).toThrow(
		'"smoothness" must be >= 0',
	);
});

test('colorKey() rejects smoothness above range', () => {
	expect(() => colorKey({smoothness: 1.1})).toThrow(
		'"smoothness" must be <= 1',
	);
});

test('colorKey() rejects spillSuppression below range', () => {
	expect(() => colorKey({spillSuppression: -0.1})).toThrow(
		'"spillSuppression" must be >= 0',
	);
});

test('colorKey() rejects spillSuppression above range', () => {
	expect(() => colorKey({spillSuppression: 1.1})).toThrow(
		'"spillSuppression" must be <= 1',
	);
});

test('colorKey() parameters produce distinct effect keys', () => {
	const defaults = colorKey();
	const blue = colorKey({keyColor: '#0000ff'});
	const tighterSimilarity = colorKey({similarity: 0.1});
	const softerEdges = colorKey({smoothness: 0.3});
	const moreSpill = colorKey({spillSuppression: 0.5});

	expect(
		new Set([
			defaults.effectKey,
			blue.effectKey,
			tighterSimilarity.effectKey,
			softerEdges.effectKey,
			moreSpill.effectKey,
		]).size,
	).toBe(5);
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

test('waves() accepts default params', () => {
	expect(() => waves()).not.toThrow();
});

test('waves() rejects invalid colors', () => {
	expect(() => waves({colors: ['#dff4ff']})).toThrow(
		'"colors" must be an array with at least 2 colors',
	);
	expect(() => waves({colors: ['#dff4ff', '' as unknown as string]})).toThrow(
		'"colors[1]" must be a non-empty string',
	);
});

test('waves() rejects invalid direction', () => {
	expect(() =>
		waves({direction: 'diagonal' as unknown as 'horizontal'}),
	).toThrow('"direction" must be "horizontal" or "vertical"');
});

test('waves() rejects non-positive wavelength', () => {
	expect(() => waves({wavelength: 0})).toThrow(
		'"wavelength" must be greater than 0',
	);
});

test('waves() rejects negative amplitude', () => {
	expect(() => waves({amplitude: -1})).toThrow(
		'"amplitude" must be greater than or equal to 0',
	);
});

test('waves() rejects non-positive thickness', () => {
	expect(() => waves({thickness: 0})).toThrow(
		'"thickness" must be greater than 0',
	);
});

test('waves() rejects non-boolean maskToSourceAlpha', () => {
	expect(() => waves({maskToSourceAlpha: 'yes' as unknown as boolean})).toThrow(
		'"maskToSourceAlpha" must be a boolean',
	);
});

test('waves() parameters produce distinct effect keys', () => {
	const defaults = waves();
	const colored = waves({colors: ['#ffffff', 'transparent']});
	const vertical = waves({direction: 'vertical'});
	const thin = waves({thickness: 20});
	const gapped = waves({gap: 24});
	const angled = waves({angle: 45});
	const shifted = waves({offset: 10});
	const stronger = waves({amplitude: 30});
	const longer = waves({wavelength: 220});
	const phased = waves({phase: 90});
	const masked = waves({maskToSourceAlpha: true});

	expect(
		new Set([
			defaults.effectKey,
			colored.effectKey,
			vertical.effectKey,
			thin.effectKey,
			gapped.effectKey,
			angled.effectKey,
			shifted.effectKey,
			stronger.effectKey,
			longer.effectKey,
			phased.effectKey,
			masked.effectKey,
		]).size,
	).toBe(11);
});

test('zigzag() accepts default params', () => {
	expect(() => zigzag()).not.toThrow();
});

test('zigzag() rejects invalid colors', () => {
	expect(() => zigzag({colors: ['#dff4ff']})).toThrow(
		'"colors" must be an array with at least 2 colors',
	);
	expect(() => zigzag({colors: ['#dff4ff', '' as unknown as string]})).toThrow(
		'"colors[1]" must be a non-empty string',
	);
});

test('zigzag() rejects invalid direction', () => {
	expect(() =>
		zigzag({direction: 'diagonal' as unknown as 'horizontal'}),
	).toThrow('"direction" must be "horizontal" or "vertical"');
});

test('zigzag() rejects non-positive wavelength', () => {
	expect(() => zigzag({wavelength: 0})).toThrow(
		'"wavelength" must be greater than 0',
	);
});

test('zigzag() rejects negative amplitude', () => {
	expect(() => zigzag({amplitude: -1})).toThrow(
		'"amplitude" must be greater than or equal to 0',
	);
});

test('zigzag() rejects non-positive thickness', () => {
	expect(() => zigzag({thickness: 0})).toThrow(
		'"thickness" must be greater than 0',
	);
});

test('zigzag() rejects non-boolean maskToSourceAlpha', () => {
	expect(() =>
		zigzag({maskToSourceAlpha: 'yes' as unknown as boolean}),
	).toThrow('"maskToSourceAlpha" must be a boolean');
});

test('zigzag() parameters produce distinct effect keys', () => {
	const defaults = zigzag();
	const colored = zigzag({colors: ['#ffffff', 'transparent']});
	const vertical = zigzag({direction: 'vertical'});
	const thin = zigzag({thickness: 20});
	const gapped = zigzag({gap: 24});
	const angled = zigzag({angle: 45});
	const shifted = zigzag({offset: 10});
	const stronger = zigzag({amplitude: 30});
	const longer = zigzag({wavelength: 220});
	const masked = zigzag({maskToSourceAlpha: true});

	expect(
		new Set([
			defaults.effectKey,
			colored.effectKey,
			vertical.effectKey,
			thin.effectKey,
			gapped.effectKey,
			angled.effectKey,
			shifted.effectKey,
			stronger.effectKey,
			longer.effectKey,
			masked.effectKey,
		]).size,
	).toBe(10);
});

test('whiteNoise() accepts default params', () => {
	expect(() => whiteNoise()).not.toThrow();
});

test('whiteNoise() rejects non-finite amount', () => {
	expect(() => whiteNoise({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('whiteNoise() rejects amount below range', () => {
	expect(() => whiteNoise({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('whiteNoise() rejects amount above range', () => {
	expect(() => whiteNoise({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('whiteNoise() rejects non-finite seed', () => {
	expect(() => whiteNoise({seed: Number.NaN})).toThrow(
		'"seed" must be a finite number',
	);
});

test('whiteNoise() parameters produce distinct effect keys', () => {
	const defaultStatic = whiteNoise();
	const subtle = whiteNoise({amount: 0.2});
	const reseeded = whiteNoise({seed: 4});

	expect(
		new Set([defaultStatic.effectKey, subtle.effectKey, reseeded.effectKey])
			.size,
	).toBe(3);
});

test('tvSignalOff() accepts default params', () => {
	expect(() => tvSignalOff()).not.toThrow();
});

test('tvSignalOff() rejects non-finite amount', () => {
	expect(() => tvSignalOff({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('tvSignalOff() rejects amount below range', () => {
	expect(() => tvSignalOff({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('tvSignalOff() rejects amount above range', () => {
	expect(() => tvSignalOff({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('tvSignalOff() parameters produce distinct effect keys', () => {
	const defaults = tvSignalOff();
	const subtle = tvSignalOff({amount: 0.2});

	expect(new Set([defaults.effectKey, subtle.effectKey]).size).toBe(2);
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

test('evolve() accepts default params', () => {
	expect(() => evolve()).not.toThrow();
});

test('evolve() rejects non-finite progress', () => {
	expect(() => evolve({progress: Number.NaN})).toThrow(
		'"progress" must be a finite number',
	);
});

test('evolve() rejects progress below range', () => {
	expect(() => evolve({progress: -0.1})).toThrow('"progress" must be >= 0');
});

test('evolve() rejects progress above range', () => {
	expect(() => evolve({progress: 1.1})).toThrow('"progress" must be <= 1');
});

test('evolve() rejects feather below range', () => {
	expect(() => evolve({feather: -0.1})).toThrow('"feather" must be >= 0');
});

test('evolve() rejects feather above range', () => {
	expect(() => evolve({feather: 1.1})).toThrow('"feather" must be <= 1');
});

test('evolve() rejects direction outside the enum', () => {
	expect(() => evolve({direction: 'diagonal' as 'left'})).toThrow(
		'"direction" must be "left", "right", "top" or "bottom", but got "diagonal"',
	);
});

test('evolve() parameters produce distinct effect keys', () => {
	const full = evolve({progress: 1, direction: 'left', feather: 0.1});
	const half = evolve({progress: 0.5, direction: 'left', feather: 0.1});
	const otherDirection = evolve({
		progress: 0.5,
		direction: 'top',
		feather: 0.1,
	});
	const otherFeather = evolve({progress: 0.5, direction: 'top', feather: 0.2});

	expect(
		new Set([
			full.effectKey,
			half.effectKey,
			otherDirection.effectKey,
			otherFeather.effectKey,
		]).size,
	).toBe(4);
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
			center: [0.3, 0.8],
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

test('vignette() rejects invalid center', () => {
	const invalidCenter = [0.5] as unknown as [number, number];
	expect(() => vignette({center: invalidCenter})).toThrow(
		'"center" must be a [number, number] tuple',
	);
});

test('vignette() accepts center outside the unit square', () => {
	expect(() => vignette({center: [-0.25, 1.25]})).not.toThrow();
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
	const shiftedVignette = vignette({center: [0.3, 0.7]});

	expect(
		new Set([
			defaultVignette.effectKey,
			strongerVignette.effectKey,
			widerVignette.effectKey,
			sharperVignette.effectKey,
			rectangularVignette.effectKey,
			coloredVignette.effectKey,
			alphaVignette.effectKey,
			shiftedVignette.effectKey,
		]).size,
	).toBe(8);
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

test('halftoneLinearGradient() connects its stop position controls', () => {
	expect(
		halftoneLinearGradient().definition.schema.firstStopPosition,
	).toMatchObject({
		type: 'uv-coordinate',
		lineTo: 'secondStopPosition',
	});
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

test('halftoneLinearGradient() rejects non-boolean maskToSourceAlpha', () => {
	expect(() =>
		halftoneLinearGradient({
			maskToSourceAlpha: 'yes' as unknown as boolean,
		}),
	).toThrow('"maskToSourceAlpha" must be a boolean');
});

test('halftoneLinearGradient() parameters produce distinct effect keys', () => {
	const defaultGradient = halftoneLinearGradient();
	const shiftedFirstStop = halftoneLinearGradient({firstStopDotSize: 8});
	const shiftedSecondStop = halftoneLinearGradient({secondStopDotSize: 20});
	const shiftedFirstPosition = halftoneLinearGradient({
		firstStopPosition: [0.2, 0.5],
	});
	const sourceColor = halftoneLinearGradient({colorMode: 'source'});
	const masked = halftoneLinearGradient({maskToSourceAlpha: true});

	expect(
		new Set([
			defaultGradient.effectKey,
			shiftedFirstStop.effectKey,
			shiftedSecondStop.effectKey,
			shiftedFirstPosition.effectKey,
			sourceColor.effectKey,
			masked.effectKey,
		]).size,
	).toBe(6);
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

test('noiseDisplacement() accepts required params', () => {
	expect(() =>
		noiseDisplacement({
			center: [0.5, 0.5],
			radius: 0.2,
		}),
	).not.toThrow();
});

test('noiseDisplacement() accepts all params', () => {
	expect(() =>
		noiseDisplacement({
			center: [0.4, 0.6],
			radius: 0.25,
			strength: 40,
			seed: 3,
			grainSize: 12,
			passes: 8,
			blur: 2,
			feather: 0.4,
			biasDirection: 225,
			biasAmount: 0.2,
		}),
	).not.toThrow();
});

test('noiseDisplacement() rejects missing center', () => {
	expect(() =>
		noiseDisplacement({radius: 0.2} as NoiseDisplacementParams),
	).toThrow('"center" must be a [number, number] tuple');
});

test('noiseDisplacement() rejects invalid center', () => {
	expect(() =>
		noiseDisplacement({
			center: [0.5] as unknown as [number, number],
			radius: 0.2,
		}),
	).toThrow('"center" must be a [number, number] tuple');
});

test('noiseDisplacement() rejects center outside unit range', () => {
	expect(() => noiseDisplacement({center: [-0.1, 0.5], radius: 0.2})).toThrow(
		'"center[0]" must be >= 0',
	);
	expect(() => noiseDisplacement({center: [0.5, 1.1], radius: 0.2})).toThrow(
		'"center[1]" must be <= 1',
	);
});

test('noiseDisplacement() rejects missing radius', () => {
	expect(() =>
		noiseDisplacement({
			center: [0.5, 0.5],
		} as unknown as NoiseDisplacementParams),
	).toThrow('"radius" must be a finite number');
});

test('noiseDisplacement() rejects invalid radius', () => {
	expect(() => noiseDisplacement({center: [0.5, 0.5], radius: 0})).toThrow(
		'"radius" must be greater than 0',
	);
	expect(() => noiseDisplacement({center: [0.5, 0.5], radius: 1.1})).toThrow(
		'"radius" must be <= 1',
	);
});

test('noiseDisplacement() rejects invalid randomization params', () => {
	expect(() =>
		noiseDisplacement({center: [0.5, 0.5], radius: 0.2, grainSize: 0}),
	).toThrow('"grainSize" must be greater than 0');
	expect(() =>
		noiseDisplacement({center: [0.5, 0.5], radius: 0.2, passes: 2.5}),
	).toThrow('"passes" must be an integer');
	expect(() =>
		noiseDisplacement({center: [0.5, 0.5], radius: 0.2, passes: 13}),
	).toThrow('"passes" must be <= 12');
	expect(() =>
		noiseDisplacement({center: [0.5, 0.5], radius: 0.2, feather: 1.1}),
	).toThrow('"feather" must be <= 1');
	expect(() =>
		noiseDisplacement({center: [0.5, 0.5], radius: 0.2, biasAmount: -0.1}),
	).toThrow('"biasAmount" must be >= 0');
});

test('noiseDisplacement() parameters produce distinct effect keys', () => {
	const base = noiseDisplacement({center: [0.5, 0.5], radius: 0.2});
	const moved = noiseDisplacement({center: [0.4, 0.5], radius: 0.2});
	const wider = noiseDisplacement({center: [0.5, 0.5], radius: 0.3});
	const stronger = noiseDisplacement({
		center: [0.5, 0.5],
		radius: 0.2,
		strength: 48,
	});
	const seeded = noiseDisplacement({center: [0.5, 0.5], radius: 0.2, seed: 1});
	const chunkier = noiseDisplacement({
		center: [0.5, 0.5],
		radius: 0.2,
		grainSize: 16,
	});
	const smeared = noiseDisplacement({
		center: [0.5, 0.5],
		radius: 0.2,
		passes: 8,
	});
	const blurred = noiseDisplacement({center: [0.5, 0.5], radius: 0.2, blur: 2});
	const feathered = noiseDisplacement({
		center: [0.5, 0.5],
		radius: 0.2,
		feather: 0.5,
	});
	const biased = noiseDisplacement({
		center: [0.5, 0.5],
		radius: 0.2,
		biasDirection: 90,
		biasAmount: 0.2,
	});

	expect(
		new Set([
			base.effectKey,
			moved.effectKey,
			wider.effectKey,
			stronger.effectKey,
			seeded.effectKey,
			chunkier.effectKey,
			smeared.effectKey,
			blurred.effectKey,
			feathered.effectKey,
			biased.effectKey,
		]).size,
	).toBe(10);
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

test('lines() accepts default params', () => {
	expect(() => lines()).not.toThrow();
});

test('lines() accepts custom colors', () => {
	expect(() => lines({colors: ['#dff4ff', 'transparent']})).not.toThrow();
});

test('lines() rejects invalid colors', () => {
	expect(() => lines({colors: ['#dff4ff']})).toThrow(
		'"colors" must be an array with at least 2 colors',
	);
	expect(() => lines({colors: ['#dff4ff', '' as unknown as string]})).toThrow(
		'"colors[1]" must be a non-empty string',
	);
});

test('lines() rejects invalid direction', () => {
	expect(() =>
		lines({direction: 'diagonal' as unknown as 'horizontal'}),
	).toThrow('"direction" must be "horizontal" or "vertical"');
});

test('lines() rejects non-finite thickness', () => {
	expect(() => lines({thickness: Number.NaN})).toThrow(
		'"thickness" must be a finite number',
	);
});

test('lines() rejects non-positive thickness', () => {
	expect(() => lines({thickness: 0})).toThrow(
		'"thickness" must be greater than 0',
	);
});

test('lines() rejects non-finite gap', () => {
	expect(() => lines({gap: Number.NaN})).toThrow(
		'"gap" must be a finite number',
	);
});

test('lines() rejects negative gap', () => {
	expect(() => lines({gap: -1})).toThrow(
		'"gap" must be greater than or equal to 0',
	);
});

test('lines() rejects non-finite angle', () => {
	expect(() => lines({angle: Number.NaN})).toThrow(
		'"angle" must be a finite number',
	);
});

test('lines() rejects non-finite offset', () => {
	expect(() => lines({offset: Number.NaN})).toThrow(
		'"offset" must be a finite number',
	);
});

test('lines() rejects non-boolean maskToSourceAlpha', () => {
	expect(() => lines({maskToSourceAlpha: 'yes' as unknown as boolean})).toThrow(
		'"maskToSourceAlpha" must be a boolean',
	);
});

test('lines() parameters produce distinct effect keys', () => {
	const defaultLines = lines();
	const colored = lines({colors: ['#ffffff', 'transparent']});
	const vertical = lines({direction: 'vertical'});
	const thin = lines({thickness: 20});
	const gapped = lines({gap: 24});
	const angled = lines({angle: 45});
	const shifted = lines({offset: 10});
	const masked = lines({maskToSourceAlpha: true});

	expect(
		new Set([
			defaultLines.effectKey,
			colored.effectKey,
			vertical.effectKey,
			thin.effectKey,
			gapped.effectKey,
			angled.effectKey,
			shifted.effectKey,
			masked.effectKey,
		]).size,
	).toBe(8);
});

test('linearProgressiveBlur() accepts default params', () => {
	expect(() => linearProgressiveBlur()).not.toThrow();
});

test('linearProgressiveBlur() connects its start and end controls', () => {
	expect(linearProgressiveBlur().definition.schema.start).toMatchObject({
		type: 'uv-coordinate',
		lineTo: 'end',
	});
});

test('linearProgressiveBlur() rejects invalid start', () => {
	expect(() =>
		linearProgressiveBlur({
			start: [0.5] as unknown as [number, number],
		}),
	).toThrow('"start" must be a [number, number] tuple');
});

test('linearProgressiveBlur() rejects invalid end', () => {
	expect(() =>
		linearProgressiveBlur({
			end: [0.5, Number.NaN],
		}),
	).toThrow('"end" must be a [number, number] tuple');
});

test('linearProgressiveBlur() rejects non-finite blur radii', () => {
	expect(() => linearProgressiveBlur({startBlur: Number.NaN})).toThrow(
		'"startBlur" must be a finite number',
	);
	expect(() => linearProgressiveBlur({endBlur: Number.NaN})).toThrow(
		'"endBlur" must be a finite number',
	);
});

test('linearProgressiveBlur() clamps negative blur radii', () => {
	const clamped = linearProgressiveBlur({startBlur: -10, endBlur: -1});
	const zero = linearProgressiveBlur({startBlur: 0, endBlur: 0});
	expect(clamped.effectKey).toBe(zero.effectKey);
});

test('linearProgressiveBlur() parameters produce distinct effect keys', () => {
	const defaults = linearProgressiveBlur();
	const shiftedStart = linearProgressiveBlur({start: [0.2, 0.5]});
	const shiftedEnd = linearProgressiveBlur({end: [0.8, 0.5]});
	const moreStartBlur = linearProgressiveBlur({startBlur: 12});
	const moreEndBlur = linearProgressiveBlur({endBlur: 80});

	expect(
		new Set([
			defaults.effectKey,
			shiftedStart.effectKey,
			shiftedEnd.effectKey,
			moreStartBlur.effectKey,
			moreEndBlur.effectKey,
		]).size,
	).toBe(5);
});

test('rings() accepts default params', () => {
	expect(() => rings()).not.toThrow();
});

test('rings() accepts custom colors', () => {
	expect(() => rings({colors: ['#dff4ff', 'transparent']})).not.toThrow();
});

test('rings() rejects invalid colors', () => {
	expect(() => rings({colors: ['#dff4ff']})).toThrow(
		'"colors" must be an array with at least 2 colors',
	);
	expect(() => rings({colors: ['#dff4ff', '' as unknown as string]})).toThrow(
		'"colors[1]" must be a non-empty string',
	);
});

test('rings() rejects invalid center', () => {
	const invalidCenter = [0.5] as unknown as [number, number];
	expect(() => rings({center: invalidCenter})).toThrow(
		'"center" must be a [number, number] tuple',
	);
});

test('rings() rejects center outside unit interval', () => {
	expect(() => rings({center: [1.1, 0.5]})).toThrow('"center[0]" must be <= 1');
	expect(() => rings({center: [0.5, -0.1]})).toThrow(
		'"center[1]" must be >= 0',
	);
});

test('rings() rejects non-finite thickness', () => {
	expect(() => rings({thickness: Number.NaN})).toThrow(
		'"thickness" must be a finite number',
	);
});

test('rings() rejects non-positive thickness', () => {
	expect(() => rings({thickness: 0})).toThrow(
		'"thickness" must be greater than 0',
	);
});

test('rings() rejects non-finite gap', () => {
	expect(() => rings({gap: Number.NaN})).toThrow(
		'"gap" must be a finite number',
	);
});

test('rings() rejects negative gap', () => {
	expect(() => rings({gap: -1})).toThrow(
		'"gap" must be greater than or equal to 0',
	);
});

test('rings() rejects non-finite offset', () => {
	expect(() => rings({offset: Number.NaN})).toThrow(
		'"offset" must be a finite number',
	);
});

test('rings() rejects non-boolean maskToSourceAlpha', () => {
	expect(() => rings({maskToSourceAlpha: 'yes' as unknown as boolean})).toThrow(
		'"maskToSourceAlpha" must be a boolean',
	);
});

test('rings() parameters produce distinct effect keys', () => {
	const defaultRings = rings();
	const colored = rings({colors: ['#ffffff', 'transparent']});
	const centered = rings({center: [0.3, 0.7]});
	const thin = rings({thickness: 20});
	const gapped = rings({gap: 24});
	const shifted = rings({offset: 10});
	const masked = rings({maskToSourceAlpha: true});

	expect(
		new Set([
			defaultRings.effectKey,
			colored.effectKey,
			centered.effectKey,
			thin.effectKey,
			gapped.effectKey,
			shifted.effectKey,
			masked.effectKey,
		]).size,
	).toBe(7);
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

test('pixelDissolve() accepts default params', () => {
	expect(() => pixelDissolve()).not.toThrow();
});

test('pixelDissolve() rejects non-finite progress', () => {
	expect(() => pixelDissolve({progress: Number.NaN})).toThrow(
		'"progress" must be a finite number',
	);
});

test('pixelDissolve() rejects progress below range', () => {
	expect(() => pixelDissolve({progress: -0.1})).toThrow(
		'"progress" must be >= 0',
	);
});

test('pixelDissolve() rejects columns below range', () => {
	expect(() => pixelDissolve({columns: 0})).toThrow('"columns" must be >= 1');
});

test('pixelDissolve() rejects rows below range', () => {
	expect(() => pixelDissolve({rows: 0})).toThrow('"rows" must be >= 1');
});

test('pixelDissolve() rejects non-integer divisions', () => {
	expect(() => pixelDissolve({columns: 10.5})).toThrow(
		'"columns" must be an integer',
	);
});

test('pixelDissolve() rejects non-finite seed', () => {
	expect(() => pixelDissolve({seed: Number.NaN})).toThrow(
		'"seed" must be a finite number',
	);
});

test('pixelDissolve() rejects feather above range', () => {
	expect(() => pixelDissolve({feather: 1.1})).toThrow('"feather" must be <= 1');
});

test('pixelDissolve() parameters produce distinct effect keys', () => {
	const defaultDissolve = pixelDissolve();
	const progressed = pixelDissolve({progress: 0.7});
	const widerGrid = pixelDissolve({columns: 12});
	const tallerGrid = pixelDissolve({rows: 12});
	const reseeded = pixelDissolve({seed: 3});
	const sharper = pixelDissolve({feather: 0.05});

	expect(
		new Set([
			defaultDissolve.effectKey,
			progressed.effectKey,
			widerGrid.effectKey,
			tallerGrid.effectKey,
			reseeded.effectKey,
			sharper.effectKey,
		]).size,
	).toBe(6);
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
