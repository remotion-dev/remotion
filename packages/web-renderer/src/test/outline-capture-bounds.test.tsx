import {expect, test} from 'vitest';
import '../symbol-dispose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {renderStillOnWeb} from '../render-still-on-web';
import {outlineCaptureBounds} from './fixtures/outline-capture-bounds';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for([
	{outline: 'none', offset: -7, extent: 0},
	{outline: '0px solid black', offset: -7, extent: 0},
	{outline: '4px solid black', offset: 7, extent: 11},
	{outline: '4px solid black', offset: -2, extent: 2},
	{outline: '4px solid black', offset: -4, extent: 0},
	{outline: '4px solid black', offset: -12, extent: 0},
])(
	'keeps outline $outline with offset $offset inside correct capture bounds',
	({outline, offset, extent}) => {
		const element = document.createElement('div');
		Object.assign(element.style, {
			position: 'absolute',
			left: '20px',
			top: '20px',
			width: '80px',
			height: '50px',
			outline,
			outlineOffset: offset + 'px',
		});
		document.body.appendChild(element);
		try {
			const paintBounds = getBiggestBoundingClientRect(element, true, false, {
				onlyOwnPlane: null,
				experimental3DRendering: null,
				includeCapturePadding: null,
			});
			const layoutBounds = getBiggestBoundingClientRect(element, false, false, {
				onlyOwnPlane: null,
				experimental3DRendering: null,
				includeCapturePadding: null,
			});
			expect([
				layoutBounds.left,
				layoutBounds.top,
				layoutBounds.right,
				layoutBounds.bottom,
			]).toEqual([20, 20, 100, 70]);
			expect([
				paintBounds.left,
				paintBounds.top,
				paintBounds.right,
				paintBounds.bottom,
			]).toEqual([20 - extent, 20 - extent, 100 + extent, 70 + extent]);
		} finally {
			element.remove();
		}
	},
);

test('paints the entire isolated box with an inward outline', async () => {
	const reference = await captureNativeReference(outlineCaptureBounds, 0, {
		omitBackground: false,
	});
	const actual = await (
		await renderStillOnWeb({
			composition: outlineCaptureBounds,
			frame: 0,
			licenseKey: 'free-license',
			inputProps: {},
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	expect((await compareNativePixels(reference, actual)).mismatchedPixels).toBe(
		0,
	);
});
