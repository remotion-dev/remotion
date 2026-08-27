import {expect, test} from 'bun:test';
import {
	createCanvasOutlinesController,
	getCanvasOutlinePointAtUv,
	getCanvasOutlineUvForPoint,
	type CanvasOutlineTarget,
} from '../index';

test('projects outline UV coordinates in both directions', () => {
	const points = [
		{x: 10, y: 20},
		{x: 180, y: 5},
		{x: 140, y: 130},
		{x: 30, y: 100},
	] as const;
	const uv = [0.35, 0.7] as const;
	const point = getCanvasOutlinePointAtUv(points, uv);
	const projectedUv = getCanvasOutlineUvForPoint(points, point);

	expect(projectedUv[0]).toBeCloseTo(uv[0]);
	expect(projectedUv[1]).toBeCloseTo(uv[1]);
});

test('publishes cropped outline geometry and keeps unchanged snapshots stable', () => {
	type TestOutlineTarget = CanvasOutlineTarget & {readonly label: string};
	const controller = createCanvasOutlinesController<TestOutlineTarget>(
		(previous, next) =>
			previous.length === next.length &&
			previous.every(
				(target, index) =>
					target.key === next[index].key &&
					target.label === next[index].label &&
					target.ref === next[index].ref &&
					target.includeOutsideContainer ===
						next[index].includeOutsideContainer &&
					target.crop.left === next[index].crop.left &&
					target.crop.right === next[index].crop.right &&
					target.crop.top === next[index].crop.top &&
					target.crop.bottom === next[index].crop.bottom,
			),
	);
	const container = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	container.getBoundingClientRect = () =>
		({
			bottom: 220,
			height: 200,
			left: 10,
			right: 210,
			top: 20,
			width: 200,
			x: 10,
			y: 20,
			toJSON: () => undefined,
		}) as DOMRect;

	const element = document.createElement('div');
	Object.defineProperties(element, {
		offsetHeight: {value: 50},
		offsetWidth: {value: 100},
	});
	let left = 20;
	Object.assign(element, {
		getBoundingClientRect: () =>
			({
				bottom: 90,
				height: 50,
				left,
				right: left + 100,
				top: 40,
				width: 100,
				x: left,
				y: 40,
				toJSON: () => undefined,
			}) as DOMRect,
		getBoxQuads: () => [
			{
				p1: {x: left, y: 40},
				p2: {x: left + 100, y: 40},
				p3: {x: left + 100, y: 90},
				p4: {x: left, y: 90},
			},
		],
	});

	const targets: readonly TestOutlineTarget[] = [
		{
			key: 'title',
			label: 'Title',
			ref: {current: element},
			crop: {bottom: 0.1, left: 0.1, right: 0.1, top: 0.1},
			includeOutsideContainer: false,
		},
	];
	let updates = 0;
	const unsubscribe = controller.subscribe(() => updates++);

	controller.update(container, targets);
	expect(controller.getSnapshot()).toEqual({
		outlines: [
			{
				key: 'title',
				dimensions: {height: 50, width: 100},
				uncroppedPoints: [
					{x: 10, y: 20},
					{x: 110, y: 20},
					{x: 110, y: 70},
					{x: 10, y: 70},
				],
				points: [
					{x: 20, y: 25},
					{x: 100, y: 25},
					{x: 100, y: 65},
					{x: 20, y: 65},
				],
			},
		],
		targets,
	});
	expect(updates).toBe(1);

	controller.update(container, targets);
	expect(updates).toBe(1);
	controller.update(container, [
		{
			...targets[0],
			crop: {...targets[0].crop},
		},
	]);
	expect(controller.getSnapshot().targets).toBe(targets);
	expect(updates).toBe(1);

	const renamedTargets = [{...targets[0], label: 'Renamed title'}];
	controller.update(container, renamedTargets);
	expect(controller.getSnapshot().targets).toBe(renamedTargets);
	expect(updates).toBe(2);

	left = 30;
	controller.update(container, renamedTargets);
	expect(controller.getSnapshot().outlines[0].points[0].x).toBe(30);
	expect(updates).toBe(3);

	controller.disconnect();
	expect(controller.getSnapshot()).toEqual({outlines: [], targets: []});
	expect(updates).toBe(4);
	unsubscribe();
});
