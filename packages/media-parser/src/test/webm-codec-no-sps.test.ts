import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('webm with codec derived from SPS', async () => {
	await parseMedia({
		src: exampleVideos.webmCodecDerivedFromSps,
		acknowledgeRemotionLicense: true,
		fields: {
			tracks: true,
		},
		reader: nodeReader,
		onVideoTrack: ({track}) => {
			expect(track.codec).toBe('avc1.42001f');
			return null;
		},
	});
});
