import {expect, test} from 'bun:test';
import {
	getCompositionDropPreviewBox,
	snapCompositionDropPosition,
} from '../components/composition-drop-preview';
import {getUnboundedCenterPointWhileScrolling} from '../helpers/get-effective-translation';

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

test('previews an equal-sized composition at the drop position', () => {
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
		left: -384,
		top: -94,
		width: 960,
		height: 540,
	});
});

test('does not clamp drop coordinates to the destination', () => {
	expect(
		getUnboundedCenterPointWhileScrolling({
			size: {
				width: 1000,
				height: 600,
				left: 100,
				top: 50,
				windowSize: {width: 1000, height: 600},
				refresh: () => undefined,
			},
			clientX: 100,
			clientY: 50,
			compositionWidth: 1920,
			compositionHeight: 1080,
			scale: 0.5,
			translation: {x: 0, y: 0},
		}),
	).toEqual({centerX: -40, centerY: -60});
});

test('snaps the dragged right edge to the destination left edge', () => {
	expect(
		snapCompositionDropPosition({
			compositionDimensions: {width: 640, height: 360},
			destinationDimensions,
			dropPosition: {centerX: -315, centerY: 540},
			scale: 1,
		}),
	).toEqual({centerX: -320, centerY: 540});
});

test('snaps the dragged left edge to the destination right edge', () => {
	expect(
		snapCompositionDropPosition({
			compositionDimensions: {width: 640, height: 360},
			destinationDimensions,
			dropPosition: {centerX: 2235, centerY: 540},
			scale: 1,
		}),
	).toEqual({centerX: 2240, centerY: 540});
});
