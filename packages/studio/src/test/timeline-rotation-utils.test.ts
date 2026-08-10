import {expect, test} from 'bun:test';
import {
	parseCssRotation,
	serializeCssRotation3d,
} from '../components/Timeline/timeline-rotation-utils';

test('parses and serializes CSS axis rotations', () => {
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
	expect(serializeCssRotation3d({axis: [0.5, 1, -2], degrees: 90})).toBe(
		'0.5 1 -2 90deg',
	);
});
