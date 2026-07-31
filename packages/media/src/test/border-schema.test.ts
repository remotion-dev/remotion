import {expect, test} from 'vitest';
import {audioSchema} from '../audio/audio';
import {videoSchema} from '../video/video';

test('Video exposes background and border controls', () => {
	expect('style.backgroundColor' in videoSchema).toBe(true);
	expect('style.borderWidth' in videoSchema).toBe(true);
	expect('style.borderStyle' in videoSchema).toBe(true);
	expect('style.borderColor' in videoSchema).toBe(true);
	expect('style.borderTopLeftRadius' in videoSchema).toBe(true);
	expect('style.borderTopRightRadius' in videoSchema).toBe(true);
	expect('style.borderBottomRightRadius' in videoSchema).toBe(true);
	expect('style.borderBottomLeftRadius' in videoSchema).toBe(true);
});

test('Video exposes crop controls', () => {
	for (const field of [
		'cropLeft',
		'cropRight',
		'cropTop',
		'cropBottom',
	] as const) {
		expect(videoSchema[field]).toMatchObject({
			type: 'number',
			default: 0,
			min: 0,
			max: 1,
			keyframable: true,
		});
	}
});

test('Audio does not expose visual background or border controls', () => {
	expect('style.backgroundColor' in audioSchema).toBe(false);
	expect('style.borderWidth' in audioSchema).toBe(false);
	expect('style.borderStyle' in audioSchema).toBe(false);
	expect('style.borderColor' in audioSchema).toBe(false);
	expect('style.borderTopLeftRadius' in audioSchema).toBe(false);
	expect('style.borderTopRightRadius' in audioSchema).toBe(false);
	expect('style.borderBottomRightRadius' in audioSchema).toBe(false);
	expect('style.borderBottomLeftRadius' in audioSchema).toBe(false);
});
