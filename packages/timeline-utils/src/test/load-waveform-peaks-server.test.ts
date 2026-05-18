import {beforeAll, expect, test} from 'bun:test';
import {registerMediabunnyServer} from '@mediabunny/server';
import {loadWaveformPeaks} from '../audio-waveform/load-waveform-peaks';

const SAMPLE_MEDIA_URL = 'https://remotion.media/video.mp4';
const EDTS_MEDIA_URL = 'https://remotion.media/edts.mp4';

beforeAll(() => {
	registerMediabunnyServer();
});

test('loadWaveformPeaks decodes an MP4 audio track with @mediabunny/server', async () => {
	const peaks = await loadWaveformPeaks(
		SAMPLE_MEDIA_URL,
		new AbortController().signal,
	);

	expect(peaks.length).toBeGreaterThan(0);
	let max = 0;
	for (let i = 0; i < peaks.length; i++) {
		expect(Number.isFinite(peaks[i])).toBe(true);
		const v = peaks[i] ?? 0;
		if (v > max) {
			max = v;
		}
	}

	expect(max).toBeGreaterThan(0.01);
});

test('loadWaveformPeaks progress matches completed peak count for MP4 audio', async () => {
	let lastCompleted = 0;
	let sawFinal = false;

	const peaks = await loadWaveformPeaks(
		SAMPLE_MEDIA_URL,
		new AbortController().signal,
		{
			progressIntervalInMs: 0,
			onProgress: ({completedPeaks, final}) => {
				lastCompleted = completedPeaks;
				if (final) {
					sawFinal = true;
				}
			},
		},
	);

	expect(sawFinal).toBe(true);
	expect(lastCompleted).toBe(peaks.length);
});

test('loadWaveformPeaks draws a non-zero first peak for edts.mp4', async () => {
	const peaks = await loadWaveformPeaks(
		EDTS_MEDIA_URL,
		new AbortController().signal,
	);

	expect(peaks.length).toBeGreaterThan(0);
	expect(Math.abs(peaks[0] ?? 0)).toBeGreaterThan(0.001);
});
