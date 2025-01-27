import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

beforeAll(async () => {
	await getRemoteExampleVideo('mp4av1');
});

test('mp4-av1', async () => {
	let samples = 0;
	let lastSampleTime = 0;

	const {slowFps, slowNumberOfFrames, audioCodec, videoCodec} =
		await parseMedia({
			src: await getRemoteExampleVideo('mp4av1'),
			fields: {
				structure: true,
				slowFps: true,
				slowNumberOfFrames: true,
				audioCodec: true,
				videoCodec: true,
			},
			reader: nodeReader,
			onVideoTrack: ({track}) => {
				expect(track.codec).toBe('av01.0.13M.08.0.110.06.01.06.0');
				return (sample) => {
					expect(Math.floor(sample.duration ?? 0)).toBe(16666);
					expect(sample.cts).toBeGreaterThanOrEqual(lastSampleTime);
					lastSampleTime = sample.cts;
					samples++;
				};
			},
			acknowledgeRemotionLicense: true,
		});

	expect(samples).toBe(1185);

	expect(slowFps).toBe(60.000000000000014);
	expect(slowNumberOfFrames).toBe(1185);
	expect(videoCodec).toBe('av1');
	expect(audioCodec).toBe(null);
});
