import {expect, test} from 'bun:test';
import {
	getDurationInFrames,
	getPlayerDimensions,
	getPlayerFps,
	getVideoPreviewStyle,
} from '../app/components/MediaPlayer';

test('uses exported video geometry without changing player timing', () => {
	const landscape = {width: 1920, height: 1080};

	expect(
		getPlayerDimensions({
			dimensions: landscape,
			isAudio: false,
			rotation: 0,
		}),
	).toEqual(landscape);
	expect(
		getPlayerDimensions({
			dimensions: landscape,
			isAudio: false,
			rotation: 90,
		}),
	).toEqual({width: 1080, height: 1920});
	expect(
		getPlayerDimensions({
			dimensions: landscape,
			isAudio: false,
			rotation: 180,
		}),
	).toEqual(landscape);

	expect(
		getDurationInFrames({
			durationInSeconds: 2.5,
			fps: 30,
		}),
	).toBe(75);

	expect(
		getVideoPreviewStyle({
			width: 1080,
			height: 1920,
			rotation: 90,
			mirrorHorizontal: true,
			mirrorVertical: false,
		}),
	).toMatchObject({
		width: 1920,
		height: 1080,
		transform: 'translate(-50%, -50%) scale(-1, 1) rotate(90deg)',
	});
});

test('only uses 60 FPS when cursor metadata was detected', () => {
	expect(
		getPlayerFps(1.54, {
			captureMetadata: {density: 2},
			mouseMovements: [],
		}),
	).toBe(60);
	expect(getPlayerFps(1.54, null)).toBe(1.54);
	expect(getPlayerFps(null, null)).toBe(30);
});
