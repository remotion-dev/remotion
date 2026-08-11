import {expect, test} from 'bun:test';
import {
	getSeekBarProgress,
	getTimeFromX,
} from '../app/components/player/player-seekbar';

test('maps the end of the seekbar to the full media duration', () => {
	expect(getTimeFromX(200, 10, 200)).toBe(10);
});

test('keeps seekbar progress within the visible bar', () => {
	expect(getSeekBarProgress(12, 10)).toBe(1);
	expect(getSeekBarProgress(-1, 10)).toBe(0);
});

test('returns an empty progress for invalid seekbar measurements', () => {
	expect(getSeekBarProgress(1, 0)).toBe(0);
	expect(getTimeFromX(20, 10, 0)).toBe(0);
});
