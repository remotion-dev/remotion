import {test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('parse mux.com m3u8', async () => {
	const fields = await parseMedia({
		src: 'https://stream.mux.com/MT43ye01xu1301RYUmrpNZeBf800iEWkicKdKLUtUv7TMI.m3u8',
		fields: {
			audioCodec: true,
			durationInSeconds: true,
		},
		acknowledgeRemotionLicense: true,
	});
	console.log(fields);
});
