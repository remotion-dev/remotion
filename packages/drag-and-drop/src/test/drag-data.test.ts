import {expect, test} from 'bun:test';
import {
	makeAssetDragData,
	makeComponentDragData,
	makeCompositionDragData,
	makeEffectDragData,
	makeElementDragData,
	makeSfxDragData,
	parseAssetDragData,
	parseComponentDragData,
	parseCompositionDragData,
	parseEffectDragData,
	parseElementDragData,
	parseSfxDragData,
} from '../index';

test('constructs and parses all payload families', () => {
	const payloads = [
		[makeAssetDragData('nested/image.png'), parseAssetDragData],
		[
			makeComponentDragData({
				componentName: 'Circle',
				dimensions: {width: 200, height: 200},
				importName: 'Circle',
				importPath: '@remotion/shapes',
				props: [{name: 'radius', value: 100}],
			}),
			parseComponentDragData,
		],
		[
			makeCompositionDragData({
				compositionFile: 'src/Root.tsx',
				compositionId: 'MyVideo',
			}),
			parseCompositionDragData,
		],
		[
			makeEffectDragData({
				name: 'brightness',
				importPath: '@remotion/effects/brightness',
				config: {brightness: 1.2},
			}),
			parseEffectDragData,
		],
		[
			makeElementDragData({
				dependencies: ['@remotion/google-fonts'],
				slug: 'overlays/lower-third',
				displayName: 'Lower Third',
				sourceCode: 'export const LowerThird = () => null;',
				dimensions: {width: 900, height: 260},
			}),
			parseElementDragData,
		],
		[
			makeSfxDragData({
				name: 'Whip',
				url: 'https://remotion.media/whip.wav',
			}),
			parseSfxDragData,
		],
	] as const;

	for (const [payload, parse] of payloads) {
		expect(parse(JSON.stringify(payload))).toEqual(payload);
	}
});

test('rejects malformed or mismatched payloads', () => {
	const parsers = [
		parseAssetDragData,
		parseComponentDragData,
		parseCompositionDragData,
		parseEffectDragData,
		parseElementDragData,
		parseSfxDragData,
	];

	for (const parse of parsers) {
		expect(parse('')).toBe(null);
		expect(parse('{')).toBe(null);
		expect(parse('{"type":"unknown","version":1}')).toBe(null);
	}
});
