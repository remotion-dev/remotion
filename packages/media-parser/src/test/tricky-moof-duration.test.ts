import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

beforeAll(async () => {
	await getRemoteExampleVideo('fragmentedMoofTrickyDuration');
});

test('non-zero duration', async () => {
	const {durationInSeconds, slowDurationInSeconds, internalStats} =
		await parseMedia({
			src: await getRemoteExampleVideo('fragmentedMoofTrickyDuration'),
			fields: {
				durationInSeconds: true,
				slowDurationInSeconds: true,
				internalStats: true,
			},
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
		});

	expect(slowDurationInSeconds).toBe(57.0019954648526);
	expect(durationInSeconds).toBe(null);

	expect(internalStats).toEqual({
		skippedBytes: 8639690,
		finalCursorOffset: 8734219,
	});
});

test('no fast duration', async () => {
	const {durationInSeconds, internalStats} = await parseMedia({
		src: await getRemoteExampleVideo('fragmentedMoofTrickyDuration'),
		fields: {
			durationInSeconds: true,
			internalStats: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(internalStats).toEqual({
		skippedBytes: 8732947,
		finalCursorOffset: 1272,
	});
	expect(durationInSeconds).toBe(null);
});
