import {beforeAll, expect, test} from 'bun:test';
import {registerMediabunnyServer} from '@mediabunny/server';
import {extractFrames} from '../extract-frames';
import {ensureSlots, WEBCODECS_TIMESCALE} from '../render-frame-strip';

const SAMPLE_MEDIA_URL = 'https://remotion.media/video.mp4';
const MAX_TIMESTAMP_DEVIATION_IN_SECONDS = 0.05;

beforeAll(() => {
	registerMediabunnyServer();
});

test('extractFrames decodes MP4 frames for the timeline film strip', async () => {
	const filledSlots = new Map<number, number | undefined>();
	const extractedSamples: Array<{
		timestamp: number;
		duration: number;
		displayWidth: number;
		displayHeight: number;
	}> = [];

	await extractFrames({
		src: SAMPLE_MEDIA_URL,
		timestampsInSeconds: ({track, container, durationInSeconds}) => {
			expect(track).toEqual({width: 1920, height: 1080});
			expect(container).toBe('MP4');
			expect(durationInSeconds).toBe(10);

			ensureSlots({
				filledSlots,
				naturalWidth: 180,
				fromSeconds: 0,
				toSeconds: 1,
				aspectRatio: track.width / track.height,
				frameHeight: 50,
			});

			return Array.from(filledSlots.keys()).map(
				(timestamp) => timestamp / WEBCODECS_TIMESCALE,
			);
		},
		onVideoSample: (sample) => {
			extractedSamples.push({
				timestamp: sample.timestamp,
				duration: sample.duration,
				displayWidth: sample.displayWidth,
				displayHeight: sample.displayHeight,
			});
			sample.close();
		},
	});

	expect(extractedSamples.length).toBe(filledSlots.size);
	expect(extractedSamples.length).toBeGreaterThan(1);

	const slotTimestamps = Array.from(filledSlots.keys()).map(
		(timestamp) => timestamp / WEBCODECS_TIMESCALE,
	);

	for (let i = 0; i < extractedSamples.length; i++) {
		const sample = extractedSamples[i];
		const slotTimestamp = slotTimestamps[i];

		expect(sample?.displayWidth).toBe(1920);
		expect(sample?.displayHeight).toBe(1080);
		expect(sample?.duration).toBeGreaterThan(0);
		expect(
			Math.abs((sample?.timestamp ?? 0) - (slotTimestamp ?? 0)),
		).toBeLessThanOrEqual(MAX_TIMESTAMP_DEVIATION_IN_SECONDS);
	}
});
