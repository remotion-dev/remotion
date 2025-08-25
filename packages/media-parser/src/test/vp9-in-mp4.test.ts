import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

beforeAll(async () => {
	await getRemoteExampleVideo('vp9InMp4');
});

test('no audio stream', async () => {
	const src = await getRemoteExampleVideo('vp9InMp4');

	await parseMedia({
		src,
		fields: {
			tracks: true,
		},
		reader: nodeReader,
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
