import {expect, test} from 'bun:test';
import type {ReactElement} from 'react';
import {getInstructions, renderAnnotation} from '../render-annotation';
import type {RoughAnnotationOptions} from '../types';

test('type none renders no annotation paths', () => {
	const result = renderAnnotation({
		rect: {x: 0, y: 0, w: 100, h: 40},
		config: {type: 'none'},
		seed: 1,
		progress: 1,
		options: {},
	});

	expect(result).toEqual([]);
});

test('circle iterations use different seeds', () => {
	const result = renderAnnotation({
		rect: {x: 0, y: 0, w: 100, h: 40},
		config: {
			type: 'circle',
			color: 'red',
			strokeWidth: 10,
			padding: {left: 0, right: 0, top: 0, bottom: 0},
			iterations: 2,
			box: 'inside',
		},
		seed: 1,
		progress: 1,
		options: {},
	});

	const paths = result.map(
		(path) => (path as ReactElement<{d: string}>).props.d,
	);
	expect(paths).toHaveLength(2);
	expect(paths[0]).not.toBe(paths[1]);
});

test('circle iteration seeds cannot be overwritten by rough options', () => {
	const result = renderAnnotation({
		rect: {x: 0, y: 0, w: 100, h: 40},
		config: {
			type: 'circle',
			color: 'red',
			strokeWidth: 10,
			padding: {left: 0, right: 0, top: 0, bottom: 0},
			iterations: 2,
			box: 'inside',
		},
		seed: 1,
		progress: 1,
		options: {seed: 1} as RoughAnnotationOptions,
	});

	const paths = result.map(
		(path) => (path as ReactElement<{d: string}>).props.d,
	);
	expect(paths).toHaveLength(2);
	expect(paths[0]).not.toBe(paths[1]);
});

test('bracket padding expands the full bracket bounds', () => {
	const result = getInstructions({
		rect: {x: 10, y: 20, w: 100, h: 40},
		config: {
			type: 'bracket',
			color: 'red',
			strokeWidth: 8,
			padding: {left: 5, right: 7, top: 11, bottom: 13},
			bracketLeft: true,
			bracketRight: true,
			bracketTop: true,
			bracketBottom: true,
		},
		seed: 1,
		options: {
			roughness: 0,
			maxRandomnessOffset: 0,
			preserveVertices: true,
		},
	});

	const coordinates = result.opList.flatMap((set) =>
		set.ops.flatMap((op) => op.data),
	);
	expect(Math.min(...coordinates)).toBe(5);
	expect(Math.max(...coordinates)).toBe(117);
	expect(coordinates).toContain(9);
	expect(coordinates).toContain(73);
});

test('bracket top padding expands left and right side height', () => {
	const result = getInstructions({
		rect: {x: 10, y: 20, w: 100, h: 40},
		config: {
			type: 'bracket',
			color: 'red',
			strokeWidth: 8,
			padding: {left: 5, right: 7, top: 11, bottom: 0},
			bracketLeft: true,
			bracketRight: true,
			bracketTop: false,
			bracketBottom: false,
		},
		seed: 1,
		options: {
			roughness: 0,
			maxRandomnessOffset: 0,
			preserveVertices: true,
		},
	});

	expect(result.opList).toHaveLength(2);

	const yCoordinates = result.opList.map((set) =>
		set.ops.flatMap((op) => op.data.filter((_, index) => index % 2 === 1)),
	);

	for (const yValues of yCoordinates) {
		expect(Math.min(...yValues)).toBe(9);
		expect(Math.max(...yValues)).toBe(60);
	}
});

test('curve controls affect circles but not brackets', () => {
	const rect = {x: 10, y: 20, w: 100, h: 40};
	const curveOptions = {
		curveFitting: 0.2,
		curveTightness: 1,
		curveStepCount: 3,
	};
	const bracketConfig = {
		type: 'bracket',
		color: 'red',
		strokeWidth: 8,
		padding: {left: 5, right: 7, top: 11, bottom: 13},
		bracketLeft: true,
		bracketRight: true,
		bracketTop: true,
		bracketBottom: true,
	} as const;
	const circleConfig = {
		type: 'circle',
		color: 'red',
		strokeWidth: 8,
		padding: {left: 5, right: 7, top: 11, bottom: 13},
		iterations: 1,
		box: 'inside',
	} as const;

	const bracketBase = getInstructions({
		rect,
		config: bracketConfig,
		seed: 1,
		options: {},
	}).opList;
	const bracketWithCurves = getInstructions({
		rect,
		config: bracketConfig,
		seed: 1,
		options: curveOptions,
	}).opList;
	const circleBase = getInstructions({
		rect,
		config: circleConfig,
		seed: 1,
		options: {},
	}).opList;
	const circleWithCurves = getInstructions({
		rect,
		config: circleConfig,
		seed: 1,
		options: curveOptions,
	}).opList;

	expect(bracketWithCurves).toEqual(bracketBase);
	expect(circleWithCurves).not.toEqual(circleBase);
});
