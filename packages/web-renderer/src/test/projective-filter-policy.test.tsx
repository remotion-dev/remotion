import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	filterInputCases,
	projectiveFilterInput,
} from './fixtures/projective-filter-input';
import {compareNativePixels} from './native-reference';

const render = async (
	kind: (typeof filterInputCases)[number]['kind'],
	preserving: boolean,
	experimental3DRendering: boolean,
) => {
	const result = await renderStillOnWeb({
		composition: projectiveFilterInput(kind, preserving),
		frame: 0,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
		experimental3DRendering,
	});
	return result.blob({format: 'png'});
};

test.for(
	filterInputCases
		.filter(({kind}) => kind === 'scaled' || kind === 'reflected')
		.flatMap(({kind}) =>
			[false, true].map((preserving) => ({kind, preserving})),
		),
)(
	'preserves existing filter pixels for $kind preserving=$preserving',
	async ({kind, preserving}) => {
		const original = await render(
			kind === 'reflected' ? 'scaled' : kind,
			preserving,
			false,
		);
		const actual = await render(kind, preserving, true);
		let expected = original;
		if (kind === 'reflected') {
			const image = await createImageBitmap(original);
			const canvas = new OffscreenCanvas(300, 300);
			try {
				const context = canvas.getContext('2d')!;
				context.translate(300, 0);
				context.scale(-1, 1);
				context.drawImage(image, 0, 0);
				expected = await canvas.convertToBlob({type: 'image/png'});
			} finally {
				image.close();
				canvas.width = 0;
				canvas.height = 0;
			}
		}

		let sample: number[] | null = null;
		if (kind === 'scaled' || kind === 'reflected') {
			const image = await createImageBitmap(actual);
			const canvas = new OffscreenCanvas(1, 1);
			try {
				const context = canvas.getContext('2d')!;
				context.drawImage(
					image,
					kind === 'scaled' ? 75 : 225,
					125,
					1,
					1,
					0,
					0,
					1,
					1,
				);
				sample = Array.from(context.getImageData(0, 0, 1, 1).data);
			} finally {
				image.close();
				canvas.width = 0;
				canvas.height = 0;
			}
		}

		const comparison = await compareNativePixels(expected, actual);
		expect(comparison.mismatchedPixels).toBe(0);
		if (sample && server.browser !== 'webkit')
			expect(sample).toEqual([0, 0, 255, 255]);
	},
);
