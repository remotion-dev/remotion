import {expect, test} from 'vitest';
import {getRetryDelay} from '../video-extraction/get-frames-since-keyframe';

test('retries frame fetches twice with bounded delays', () => {
	const error = new Error('Failed to fetch');
	const src = 'blob:test';

	expect(getRetryDelay(1, error, src)).toBe(0.25);
	expect(getRetryDelay(2, error, src)).toBe(0.5);
	expect(getRetryDelay(3, error, src)).toBe(null);
});
