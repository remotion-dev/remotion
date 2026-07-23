import {expect, test} from 'bun:test';
import {getCompositionDropPreviewBox} from '../components/composition-drop-preview';

const canvasSize = {
	width: 992,
	height: 572,
	left: 0,
	top: 0,
};
const destinationDimensions = {width: 1920, height: 1080};
const previewSize = {
	size: 'auto' as const,
	translation: {x: 0, y: 0},
};

test('centers a composition drop preview under the pointer', () => {
	expect(
		getCompositionDropPreviewBox({
			canvasSize,
			destinationDimensions,
			previewSize,
			preview: {
				compositionDimensions: {width: 640, height: 360},
				dropPosition: {centerX: 960, centerY: 540},
			},
		}),
	).toEqual({
		left: 336,
		top: 196,
		width: 320,
		height: 180,
	});
});

test('previews an equal-sized composition at the destination origin', () => {
	expect(
		getCompositionDropPreviewBox({
			canvasSize,
			destinationDimensions,
			previewSize: {
				size: 'auto',
				translation: {x: 20, y: -10},
			},
			preview: {
				compositionDimensions: destinationDimensions,
				dropPosition: {centerX: 200, centerY: 300},
			},
		}),
	).toEqual({
		left: -4,
		top: 26,
		width: 960,
		height: 540,
	});
});
