import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should be able to parse WAVE_FORMAT_EXTENSIBLE', async () => {
	let sampleCount = 0;
	await parseMedia({
		src: exampleVideos.waveFormatExtensible,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			container: true,
			slowDurationInSeconds: true,
		},
		onAudioTrack: ({track}) => {
			expect(track.numberOfChannels).toBe(2);
			expect(track.sampleRate).toBe(48000);
			return () => {
				sampleCount++;
			};
		},
	});
	expect(sampleCount).toBe(250);
});
