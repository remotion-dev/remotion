import {expect, test} from 'bun:test';
import {
	parseCssRotation,
	parseCssRotationToEuler,
	serializeCssRotationFromEuler,
} from '../components/Timeline/timeline-rotation-utils';

test('parses CSS axis rotations', () => {
	expect(parseCssRotation('45deg')).toEqual({
		axis: [0, 0, 1],
		degrees: 45,
	});
	expect(parseCssRotation('x 0.25turn')).toEqual({
		axis: [1, 0, 0],
		degrees: 90,
	});
	expect(parseCssRotation('0.5 1 -2 100grad')).toEqual({
		axis: [0.5, 1, -2],
		degrees: 90,
	});
});

test('converts CSS rotations to X, Y and Z angles', () => {
	expect(parseCssRotationToEuler('45deg')).toEqual([0, 0, 45]);
	expect(parseCssRotationToEuler('x 90deg')).toEqual([90, 0, 0]);
	expect(parseCssRotationToEuler('y -45deg')).toEqual([0, -45, 0]);
	expect(parseCssRotationToEuler('-2.4 -5 2.9 0deg')).toEqual([0, 0, 0]);
});

test('serializes X, Y and Z angles as CSS rotations', () => {
	expect(serializeCssRotationFromEuler({rotation: [0, 0, 45]})).toBe('45deg');
	expect(serializeCssRotationFromEuler({rotation: [30, 0, 0]})).toBe('x 30deg');
	expect(serializeCssRotationFromEuler({rotation: [0, -20, 0]})).toBe(
		'y -20deg',
	);
	expect(serializeCssRotationFromEuler({rotation: [0, 0, 0]})).toBe('0deg');

	const serialized = serializeCssRotationFromEuler({
		rotation: [30, 45, 60],
	});
	const parsed = parseCssRotationToEuler(serialized);
	expect(parsed[0]).toBeCloseTo(30, 4);
	expect(parsed[1]).toBeCloseTo(45, 4);
	expect(parsed[2]).toBeCloseTo(60, 4);
});
