import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

beforeAll(async () => {
	await getRemoteExampleVideo('fragmentedMoofTrickyDuration');
});

test('non-zero duration', async () => {
	const {durationInSeconds, slowDurationInSeconds} = await parseMedia({
		src: await getRemoteExampleVideo('fragmentedMoofTrickyDuration'),
		fields: {
			durationInSeconds: true,
			slowDurationInSeconds: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(slowDurationInSeconds).toBe(57.001995464852605);
	expect(durationInSeconds).toBe(57.001995464852605);
});
