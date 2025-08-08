import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

// https://discord.com/channels/809501355504959528/990308056627806238/1403043606566273054
// Have not yet received permission to use the file
test.skip('no audio stream', async () => {
	await parseMedia({
		src: '/Users/jonathanburger/Downloads/rem0708.mp4',
		reader: nodeReader,
		fields: {
			tracks: true,
		},
		acknowledgeRemotionLicense: true,
		onVideoTrack: ({track}) => {
			expect(track.colorSpace).toEqual({
				transfer: 'bt709',
				matrix: 'bt709',
				primaries: 'bt709',
				fullRange: false,
			});
			expect(track.codec).toBe('vp09.01.40.08');
			return null;
		},
	});
});
