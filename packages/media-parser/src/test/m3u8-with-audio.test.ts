import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test(
	'parse m3u8',
	async () => {
		const {audioCodec} = await parseMedia({
			src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
			acknowledgeRemotionLicense: true,
			fields: {
				audioCodec: true,
			},
		});

		expect(audioCodec).toBe('aac');
	},
	{
		timeout: 30000,
	},
);
