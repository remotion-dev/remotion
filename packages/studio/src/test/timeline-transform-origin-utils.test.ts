import {expect, test} from 'bun:test';
import {
	parseTransformOrigin,
	serializeTransformOrigin,
} from '../components/Timeline/timeline-transform-origin-utils';

test('parseTransformOrigin maps keywords to percentage coordinates', () => {
	expect(parseTransformOrigin('left top')).toEqual({
		x: {value: 0, unit: '%'},
		y: {value: 0, unit: '%'},
		z: null,
	});
	expect(parseTransformOrigin('bottom right')).toEqual({
		x: {value: 100, unit: '%'},
		y: {value: 100, unit: '%'},
		z: null,
	});
	expect(parseTransformOrigin('center top')).toEqual({
		x: {value: 50, unit: '%'},
		y: {value: 0, unit: '%'},
		z: null,
	});
});

test('parseTransformOrigin preserves units and z component', () => {
	expect(parseTransformOrigin('12px 34% 5px')).toEqual({
		x: {value: 12, unit: 'px'},
		y: {value: 34, unit: '%'},
		z: '5px',
	});
});

test('serializeTransformOrigin preserves coordinate units', () => {
	expect(
		serializeTransformOrigin({
			x: {value: 0.1 + 0.2, unit: '%'},
			y: {value: 10.020000000000001, unit: 'px'},
			z: null,
		}),
	).toBe('0.3% 10px');
});
