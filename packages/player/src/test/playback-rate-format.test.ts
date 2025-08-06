import {expect, test} from 'bun:test';

// Extract the formatPlaybackRate function for testing
const formatPlaybackRate = (rate: number): string => {
	const str = rate.toString();
	// If the string doesn't contain a decimal point, add ".0"
	return str.includes('.') ? str : str + '.0';
};

test('formatPlaybackRate should show full precision for decimal numbers', () => {
	expect(formatPlaybackRate(0.75)).toBe('0.75');
	expect(formatPlaybackRate(1.25)).toBe('1.25');
	expect(formatPlaybackRate(1.5)).toBe('1.5');
	expect(formatPlaybackRate(0.5)).toBe('0.5');
});

test('formatPlaybackRate should add .0 to whole numbers', () => {
	expect(formatPlaybackRate(1)).toBe('1.0');
	expect(formatPlaybackRate(2)).toBe('2.0');
	expect(formatPlaybackRate(3)).toBe('3.0');
});

test('formatPlaybackRate should handle edge cases', () => {
	expect(formatPlaybackRate(0.1)).toBe('0.1');
	expect(formatPlaybackRate(10)).toBe('10.0');
	expect(formatPlaybackRate(0.125)).toBe('0.125');
});