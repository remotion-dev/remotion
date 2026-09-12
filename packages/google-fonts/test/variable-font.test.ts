import {expect, mock, test} from 'bun:test';

mock.module('remotion', () => ({
	continueRender: () => undefined,
	delayRender: () => 0,
}));
mock.module('remotion/no-react', () => ({
	NoReactInternals: {
		ENABLE_V5_BREAKING_CHANGES: false,
	},
}));

test('loads variable font faces from a generated module and font info', async () => {
	const {getInfo, loadVariableFont} = await import('../src/NotoSans');
	const {loadVariableFontFromInfo} = await import('../src/from-info');
	const originalFontFace = globalThis.FontFace;
	const descriptors: FontFaceDescriptors[] = [];
	const addedFontFaces: FontFace[] = [];

	class MockFontFace {
		status: FontFaceLoadStatus = 'unloaded';

		constructor(
			_fontFamily: string,
			_source: string,
			fontDescriptors?: FontFaceDescriptors,
		) {
			if (fontDescriptors) {
				descriptors.push(fontDescriptors);
			}
		}

		load() {
			this.status = 'loaded';
			return Promise.resolve(this);
		}
	}

	globalThis.FontFace = MockFontFace as unknown as typeof FontFace;

	try {
		const document = {
			fonts: {
				add: (fontFace: FontFace) => {
					addedFontFaces.push(fontFace);
				},
			},
		} as unknown as Document;
		const loaded = loadVariableFont('normal', {
			document,
			subsets: ['latin'],
		});

		expect(loaded.fontFamily).toBe('Noto Sans');
		expect(loaded.axes.wdth).toEqual({min: 62.5, max: 100});
		expect(loaded.axes.wght).toEqual({min: 100, max: 900});
		await loaded.waitUntilDone();
		const loadedFromInfo = loadVariableFontFromInfo(getInfo(), 'italic', {
			document,
			subsets: ['latin'],
		});
		await loadedFromInfo.waitUntilDone();

		expect(descriptors).toEqual([
			{
				stretch: '62.5% 100%',
				style: 'normal',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				weight: '100 900',
			},
			{
				stretch: '62.5% 100%',
				style: 'italic',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				weight: '100 900',
			},
		]);
		expect(addedFontFaces).toHaveLength(2);
		expect(addedFontFaces[0]).toBeInstanceOf(MockFontFace);
		expect(addedFontFaces[1]).toBeInstanceOf(MockFontFace);
	} finally {
		globalThis.FontFace = originalFontFace;
	}
});
