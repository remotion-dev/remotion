import {expect, test} from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {getLottieMetadata} from '../get-lottie-metadata';

test('Should be able to get Lottie metadata', () => {
	const file = fs.readFileSync(path.join(__dirname, 'example.json'), 'utf-8');

	const parsed = JSON.parse(file);

	expect(getLottieMetadata(parsed)).toEqual({
		durationInFrames: 90,
		durationInSeconds: 3.0030030030030037,
		fps: 29.9700012207031,
		height: 1080,
		width: 1920,
	});
});

test('Should return null if invalid Lottie file', () => {
	// @ts-expect-error
	expect(getLottieMetadata({})).toEqual(null);
});
