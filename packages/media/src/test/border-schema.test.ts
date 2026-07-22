import {expect, test} from 'vitest';
import {audioSchema} from '../audio/audio';
import {videoSchema} from '../video/video';

test('Video exposes border controls', () => {
	expect('style.borderWidth' in videoSchema).toBe(true);
	expect('style.borderStyle' in videoSchema).toBe(true);
	expect('style.borderColor' in videoSchema).toBe(true);
});

test('Audio does not expose visual border controls', () => {
	expect('style.borderWidth' in audioSchema).toBe(false);
	expect('style.borderStyle' in audioSchema).toBe(false);
	expect('style.borderColor' in audioSchema).toBe(false);
});
