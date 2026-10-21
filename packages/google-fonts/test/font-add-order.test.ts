import {expect, mock, test} from 'bun:test';
import type {FontInfo} from '../src/base';

const fetchedSlices: number[] = [];

mock.module('remotion', () => ({
	continueRender: () => undefined,
	delayRender: () => 0,
}));
mock.module('remotion/no-react', () => ({
	NoReactInternals: {
		ENABLE_V5_BREAKING_CHANGES: false,
		fetchFontData: (url: string) => {
			const match = /order-(\d+)\.woff2$/.exec(url);
			if (!match) {
				return Promise.resolve(new ArrayBuffer(4));
			}

			const index = Number(match[1]);
			return new Promise<ArrayBuffer>((resolve) => {
				setTimeout(
					() => {
						fetchedSlices.push(index);
						resolve(new Uint8Array([index]).buffer);
					},
					(4 - index) * 25,
				);
			});
		},
		registerFontFace: () => undefined,
	},
}));

test.each(['static', 'variable'])(
	'adds %s font faces in subset order when slices finish loading in reverse order',
	async (kind) => {
		const {loadFonts, loadVariableFonts} = await import('../src/base');
		const originalFontFace = globalThis.FontFace;
		const loadedSlices: number[] = [];
		const addedSlices: number[] = [];
		fetchedSlices.length = 0;

		class MockFontFace {
			status: FontFaceLoadStatus = 'unloaded';
			index: number;

			constructor(
				_fontFamily: string,
				source: string | BufferSource,
				_descriptors: FontFaceDescriptors | null,
			) {
				this.index = new Uint8Array(source as ArrayBuffer)[0];
			}

			load() {
				return new Promise<this>((resolve) => {
					setTimeout(
						() => {
							this.status = 'loaded';
							loadedSlices.push(this.index);
							resolve(this);
						},
						(4 - this.index) * 25,
					);
				});
			}
		}

		globalThis.FontFace = MockFontFace as unknown as typeof FontFace;

		try {
			const subsets = ['[0]', '[1]', '[2]', '[3]'];
			const fontFaces = subsets.map((subset, index) => ({
				style: 'normal',
				weight: '100 900',
				stretch: null,
				subset,
				unicodeRange: `U+${(0x3000 + index).toString(16)}`,
				src: `https://example.com/order-${index}.woff2`,
			}));
			const meta: FontInfo = {
				fontFamily: `Ordered ${kind} font`,
				importName: 'OrderedFont',
				version: 'v1',
				url: 'https://example.com/font.css',
				unicodeRanges: Object.fromEntries(
					fontFaces.map((face) => [face.subset, face.unicodeRange]),
				),
				fonts: {
					normal: {
						'400': Object.fromEntries(
							fontFaces.map((face) => [face.subset, face.src]),
						),
					},
				},
				subsets,
				variable: {
					axes: {wght: {min: 100, max: 900}},
					fontFaces,
					url: 'https://example.com/variable.css',
				},
			};
			const document = {
				fonts: {
					add: (fontFace: MockFontFace) => {
						addedSlices.push(fontFace.index);
					},
				},
			} as unknown as Document;
			const loaded =
				kind === 'static'
					? loadFonts(meta, 'normal', {document, weights: ['400'], subsets})
					: loadVariableFonts(meta, 'normal', {document, subsets});
			await loaded.waitUntilDone();

			expect(fetchedSlices).toEqual([3, 2, 1, 0]);
			expect(loadedSlices).toEqual([3, 2, 1, 0]);
			expect(addedSlices).toEqual([0, 1, 2, 3]);
		} finally {
			globalThis.FontFace = originalFontFace;
		}
	},
);
