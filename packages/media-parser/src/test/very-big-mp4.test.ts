import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

beforeAll(async () => {
	await getRemoteExampleVideo('largeStsd');
});

test(
	'should process the stsd of a 2 hour long video',
	async () => {
		let videoSamples = 0;
		let audioSamples = 0;

		const {durationInSeconds} = await parseMedia({
			// Video is cropped to only the first few frames
			src: await getRemoteExampleVideo('largeStsd'),
			reader: nodeReader,
			fields: {
				durationInSeconds: true,
			},
			acknowledgeRemotionLicense: true,
			onVideoTrack: () => {
				return () => {
					videoSamples++;
				};
			},
			onAudioTrack: () => {
				return () => {
					audioSamples++;
				};
			},
		});

		expect(videoSamples).toBe(6);
		expect(audioSamples).toBe(5);
		expect(durationInSeconds).toBe(22947.121);
	},
	{
		timeout: 10000,
	},
);
