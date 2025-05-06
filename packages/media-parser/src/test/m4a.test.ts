import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('should work on voice note', async () => {
	let samples = 0;

	const {audioCodec} = await parseMedia({
		src: exampleVideos.m4a,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		onVideoTrack: () => {
			throw new Error('No video track');
		},
		fields: {
			audioCodec: true,
			videoCodec: true,
			container: true,
			dimensions: true,
			duration: true,
			metadata: true,
			structure: true,
		},
		onAudioTrack: (track) => {
			const {trakBox, ...trk} = track.track;
			expect(trk).toEqual({
				type: 'audio',
				trackId: 1,
				timescale: 48000,
				codec: 'mp4a.40.02',
				numberOfChannels: 1,
				sampleRate: 48000,
				description: new Uint8Array([17, 136]),
				codecPrivate: new Uint8Array([17, 136]),
				codecWithoutConfig: 'aac',
			});

			return () => {
				samples++;
			};
		},
	});

	expect(audioCodec).toBe('aac');
	expect(samples).toBe(236);
});
