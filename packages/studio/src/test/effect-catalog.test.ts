import {expect, test} from 'bun:test';
import {
	EFFECT_CATALOG,
	getEffectDocumentationLink,
} from '@remotion/studio-shared';

test('effect catalog exposes documentation links for picker context menu', () => {
	const links = new Map(
		EFFECT_CATALOG.map((item) => [
			item.label,
			getEffectDocumentationLink(item),
		]),
	);

	expect(links.get('brightness()')).toBe(
		'https://www.remotion.dev/effects/brightness',
	);
	expect(links.get('colorCorrection()')).toBe(
		'https://www.remotion.dev/effects/color-correction',
	);
	expect(links.get('xyTranslate()')).toBe(
		'https://www.remotion.dev/effects/xy-translate',
	);
	expect(links.get('uvTranslate()')).toBe(
		'https://www.remotion.dev/effects/uv-translate',
	);
	expect(links.get('pixelate()')).toBe(
		'https://www.remotion.dev/effects/pixelate',
	);
	expect(links.get('linearProgressivePixelate()')).toBe(
		'https://www.remotion.dev/effects/linear-progressive-pixelate',
	);
	expect(links.get('radialProgressivePixelate()')).toBe(
		'https://www.remotion.dev/effects/radial-progressive-pixelate',
	);
	expect(links.get('shrinkwrap()')).toBe(
		'https://www.remotion.dev/effects/shrinkwrap',
	);
	expect(links.get('lightLeak()')).toBe(
		'https://www.remotion.dev/effects/light-leak',
	);
	expect(links.get('starburst()')).toBe(
		'https://www.remotion.dev/effects/starburst',
	);
});
