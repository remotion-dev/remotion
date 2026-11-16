import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	textDecorationLengthGrid,
	textDecorationLengthGridCells,
} from './fixtures/text-decoration-length';
import {captureNativeReference, compareNativePixels} from './native-reference';

// Every case is a cell of one grid composition, so each frame needs one
// capture/render per declaration style. Mismatches are attributed per cell.
const mismatchedCells = async (math: Blob, px: Blob) => {
	const {diff, mismatchedPixels} = await compareNativePixels(math, px);
	const bitmap = await createImageBitmap(diff);
	const canvas = document.createElement('canvas');
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const context = canvas.getContext('2d', {willReadFrequently: true})!;
	context.drawImage(bitmap, 0, 0);
	bitmap.close();
	const {data} = context.getImageData(0, 0, canvas.width, canvas.height);
	let attributed = 0;
	const cells = textDecorationLengthGridCells.flatMap((cell) => {
		let cellPixels = 0;
		for (let y = cell.top; y < cell.top + cell.height; y++) {
			for (let x = cell.left; x < cell.left + cell.width; x++) {
				if (data[(y * canvas.width + x) * 4 + 3] !== 0) cellPixels++;
			}
		}

		attributed += cellPixels;
		return cellPixels ? [`${cell.id}: ${cellPixels}px`] : [];
	});
	return attributed === mismatchedPixels
		? cells
		: [...cells, `outside cells: ${mismatchedPixels - attributed}px`];
};

test.for([0, 1])(
	'resolves decoration thicknesses like their pixel declarations at frame %i',
	async (frame) => {
		const {fixture, reference} = textDecorationLengthGrid;
		const nativeRelative = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const nativeAbsolute = await captureNativeReference(reference, frame, {
			omitBackground: false,
		});
		expect(
			await mismatchedCells(nativeRelative, nativeAbsolute),
			'native cells differing from their px declaration',
		).toEqual([]);
		const render = async (composition: typeof fixture) =>
			(
				await renderStillOnWeb({
					composition,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		// This checks declaration equivalence. Native text raster parity remains
		// separately tracked; the existing painter approximates line placement.
		const relative = await render(fixture);
		const absolute = await render(reference);
		expect(
			await mismatchedCells(relative, absolute),
			'rendered cells differing from their px declaration',
		).toEqual([]);
	},
);
