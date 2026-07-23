import {expect, test} from 'bun:test';
import {
	parseTranslate,
	serializeTranslate,
} from '../components/Timeline/timeline-translate-utils';

test('parseTranslate normalizes floating point noise', () => {
	expect(parseTranslate('10.020000000000001px 30.240000000000002px')).toEqual([
		10.02, 30.24,
	]);
});

test('serializeTranslate normalizes floating point noise', () => {
	expect(serializeTranslate(0.1 + 0.2, 10.020000000000001)).toBe('0.3px 10px');
});

test('serializeTranslate limits coordinates to one decimal place', () => {
	expect(serializeTranslate(254.854512, 393.565342)).toBe('254.9px 393.6px');
});

test('serializeTranslate respects more precise steps', () => {
	expect(serializeTranslate(254.854512, 393.565342, 2)).toBe(
		'254.85px 393.57px',
	);
});
