import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

beforeAll(async () => {
	await getRemoteExampleVideo('veryDispersed');
});

test(
	'weird seek',
	async () => {
		let samples = 0;

		await parseMedia({
			src: await getRemoteExampleVideo('veryDispersed'),
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			onVideoTrack: () => {
				return () => {
					samples++;
				};
			},
			onAudioTrack: () => {
				return () => {
					samples++;
				};
			},
		});

		expect(samples).toBe(9644);
	},
	{timeout: 30_000},
);
