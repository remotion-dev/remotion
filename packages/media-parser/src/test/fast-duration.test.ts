import {test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test(
	'fast test',
	async () => {
		let samples = 0;
		await parseMedia({
			src: '/Users/jonathanburger/Downloads/0205mp4.mp4',
			fields: {
				durationInSeconds: true,
				slowDurationInSeconds: true,
				dimensions: true,
				videoCodec: true,
				audioCodec: true,
			},
			onVideoTrack: (track) => {
				return (sample) => {
					samples++;
					console.log(samples, sample.decodingTimestamp);
				};
			},
			onAudioTrack: (track) => {
				return (sample) => {
					// console.log(sample.timestamp);
				};
			},
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
		});
	},
	{timeout: 1000000},
);
/*
test('fast test', async () => {
	const contents = await parseMedia({
		src: '/Users/jonathanburger/Downloads/img4661mov.mov',
		fields: {
			durationInSeconds: true,
			slowDurationInSeconds: true,
			dimensions: true,
			videoCodec: true,
			audioCodec: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});
});
*/
