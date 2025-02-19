import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('mehmet video should be fast', async () => {
	if (process.platform === 'win32') {
		return;
	}

	let audioTracks = 0;
	let audioSamples = 0;
	await parseMedia({
		src: exampleVideos.iphonelivefoto,
		reader: nodeReader,
		fields: {
			structure: true,
		},
		onVideoTrack: () => {
			return () => {};
		},
		onAudioTrack: ({track}) => {
			expect(track.codec).toBe('pcm-s16');
			expect(track.numberOfChannels).toBe(1);
			audioTracks++;
			return () => {
				audioSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioTracks).toBe(1);
	expect(audioSamples).toBe(6);
});
