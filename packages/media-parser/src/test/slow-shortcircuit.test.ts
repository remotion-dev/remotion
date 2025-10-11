import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

beforeAll(async () => {
	await getRemoteExampleVideo('largeStsd');
});

test('if metadata is available, it should not use duration from metadata even in case of using the "slow" fields', async () => {
	const {slowFps, slowDurationInSeconds, internalStats} = await parseMedia({
		src: await getRemoteExampleVideo('largeStsd'),
		acknowledgeRemotionLicense: true,
		fields: {
			slowDurationInSeconds: true,
			slowFps: true,
			internalStats: true,
		},
		reader: nodeReader,
	});

	expect(slowFps).toBe(23.976024846723483);
	expect(slowDurationInSeconds).toBe(22947.121);
	expect(internalStats.skippedBytes).toBe(152932);
	expect(internalStats.finalCursorOffset).toBe(18436532);

	const {
		durationInSeconds,
		internalStats: internalStats2,
		fps,
	} = await parseMedia({
		src: await getRemoteExampleVideo('largeStsd'),
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
			internalStats: true,
			fps: true,
		},
		reader: nodeReader,
	});

	expect(durationInSeconds).toBe(22947.121);
	expect(fps).toBe(23.976024846723483);
	expect(internalStats2.skippedBytes).toBe(152940);
	expect(internalStats2.finalCursorOffset).toBe(18436524);
});
