import {expect, test} from 'bun:test';
import {EFFECT_CATALOG} from '@remotion/studio-shared';
import {filterEffectCatalog} from '../components/effect-picker-search';

test('effect picker search ranks exact effect names first', () => {
	const results = filterEffectCatalog({
		items: EFFECT_CATALOG,
		query: 'noise()',
	});

	expect(results.map((item) => item.label).slice(0, 3)).toEqual([
		'noise()',
		'noiseDisplacement()',
		'whiteNoise()',
	]);
	expect(results.map((item) => item.label)).not.toContain('brightness()');
	expect(results.map((item) => item.label)).not.toContain('colorKey()');
});

test('effect picker search handles punctuation-insensitive names', () => {
	expect(
		filterEffectCatalog({
			items: EFFECT_CATALOG,
			query: 'color key',
		})[0].label,
	).toBe('colorKey()');

	expect(
		filterEffectCatalog({
			items: EFFECT_CATALOG,
			query: 'drop-shadow',
		})[0].label,
	).toBe('dropShadow()');
});

test('effect picker search preserves table-of-contents order for empty queries', () => {
	expect(
		filterEffectCatalog({
			items: EFFECT_CATALOG,
			query: '',
		})
			.slice(0, 3)
			.map((item) => item.label),
	).toEqual(['brightness()', 'contrast()', 'colorKey()']);
});
