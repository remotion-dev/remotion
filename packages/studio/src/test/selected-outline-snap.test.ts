import {expect, test} from 'bun:test';
import type {SelectedOutline} from '../components/selected-outline-geometry';
import {
	findSelectedOutlineSnap,
	getSelectedOutlineSnapTargets,
	type SelectedOutlineSnapTarget,
} from '../components/selected-outline-snap';
import type {Guide} from '../state/editor-guides';

const makeOutline = ({
	height,
	left,
	scale = 1,
	top,
	width,
}: {
	readonly height: number;
	readonly left: number;
	readonly scale?: number;
	readonly top: number;
	readonly width: number;
}): SelectedOutline => {
	const right = left + width;
	const bottom = top + height;

	return {
		key: 'outline',
		dimensions: {width, height},
		points: [
			{x: left * scale, y: top * scale},
			{x: right * scale, y: top * scale},
			{x: right * scale, y: bottom * scale},
			{x: left * scale, y: bottom * scale},
		],
	};
};

const getTargets = (
	guides: readonly Guide[] = [],
): readonly SelectedOutlineSnapTarget[] => {
	return getSelectedOutlineSnapTargets({
		compositionHeight: 600,
		compositionWidth: 1000,
		guides,
	});
};

test('selected outlines snap to the horizontal and vertical canvas center', () => {
	const result = findSelectedOutlineSnap({
		allowX: true,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [makeOutline({left: 455, top: 245, width: 100, height: 110})],
		scale: 1,
		targets: getTargets(),
	});

	expect(result.snapOffsetX).toBe(-5);
	expect(result.snapOffsetY).toBe(0);
	expect(result.activeSnapPoints.map((point) => point.target.type)).toEqual([
		'canvas-horizontal-center',
		'canvas-vertical-center',
	]);
});

test('selected outlines snap their edges to canvas edges', () => {
	const result = findSelectedOutlineSnap({
		allowX: true,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [makeOutline({left: 892, top: 6, width: 100, height: 100})],
		scale: 1,
		targets: getTargets(),
	});

	expect(result.snapOffsetX).toBe(8);
	expect(result.snapOffsetY).toBe(-6);
	expect(result.activeSnapPoints.map((point) => point.edge)).toEqual([
		'right',
		'top',
	]);
});

test('snap threshold is measured in screen pixels', () => {
	const result = findSelectedOutlineSnap({
		allowX: true,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [
			makeOutline({left: 456, top: 245, width: 100, height: 110, scale: 2}),
		],
		scale: 2,
		targets: getTargets(),
	});

	expect(result.snapOffsetX).toBe(null);
	expect(result.snapOffsetY).toBe(0);
	expect(result.activeSnapPoints.map((point) => point.target.type)).toEqual([
		'canvas-vertical-center',
	]);
});

test('visible guides become snap targets for item edges and centers', () => {
	const guides: Guide[] = [
		{
			compositionId: 'comp',
			id: 'vertical-guide',
			orientation: 'vertical',
			position: 300,
			show: true,
		},
		{
			compositionId: 'comp',
			id: 'hidden-guide',
			orientation: 'horizontal',
			position: 240,
			show: false,
		},
	];
	const result = findSelectedOutlineSnap({
		allowX: true,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [makeOutline({left: 245, top: 125, width: 100, height: 100})],
		scale: 1,
		targets: getTargets(guides),
	});

	expect(result.snapOffsetX).toBe(5);
	expect(result.snapOffsetY).toBe(null);
	expect(result.activeSnapPoints).toHaveLength(1);
	expect(result.activeSnapPoints[0].edge).toBe('center-x');
	expect(result.activeSnapPoints[0].target.type).toBe('guide-vertical');
});

test('axis lock prevents snapping along the locked axis', () => {
	const result = findSelectedOutlineSnap({
		allowX: false,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [makeOutline({left: 455, top: 245, width: 100, height: 110})],
		scale: 1,
		targets: getTargets(),
	});

	expect(result.snapOffsetX).toBe(null);
	expect(result.snapOffsetY).toBe(0);
	expect(result.activeSnapPoints.map((point) => point.target.type)).toEqual([
		'canvas-vertical-center',
	]);
});

test('full-canvas selections prefer center snap when edges tie', () => {
	const result = findSelectedOutlineSnap({
		allowX: true,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [makeOutline({left: 0, top: 0, width: 1000, height: 600})],
		scale: 1,
		targets: getTargets(),
	});

	expect(result.snapOffsetX).toBe(0);
	expect(result.snapOffsetY).toBe(0);
	expect(result.activeSnapPoints.map((point) => point.target.type)).toEqual([
		'canvas-horizontal-center',
		'canvas-vertical-center',
	]);
});
