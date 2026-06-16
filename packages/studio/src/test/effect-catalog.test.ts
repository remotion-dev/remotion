import {expect, test} from 'bun:test';
import {
	EFFECT_CATALOG,
	getEffectDocumentationLink,
} from '../components/effect-catalog';

test('effect catalog exposes documentation links for picker context menu', () => {
	const links = new Map(
		EFFECT_CATALOG.map((item) => [
			item.label,
			getEffectDocumentationLink(item),
		]),
	);

	expect(links.get('brightness()')).toBe(
		'https://www.remotion.dev/docs/effects/brightness',
	);
	expect(links.get('xyTranslate()')).toBe(
		'https://www.remotion.dev/docs/effects/xy-translate',
	);
	expect(links.get('uvTranslate()')).toBe(
		'https://www.remotion.dev/docs/effects/uv-translate',
	);
	expect(links.get('lightLeak()')).toBe(
		'https://www.remotion.dev/docs/light-leaks/light-leak-effect',
	);
	expect(links.get('starburst()')).toBe(
		'https://www.remotion.dev/docs/starburst/starburst-effect',
	);
});
