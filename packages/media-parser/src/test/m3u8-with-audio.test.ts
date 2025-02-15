import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('parse m3u8', async () => {
	const {audioCodec} = await parseMedia({
		src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		acknowledgeRemotionLicense: true,
		fields: {
			audioCodec: true,
		},
		logLevel: 'trace',
	});

	expect(audioCodec).toBe('mp4a.40.2');
});
