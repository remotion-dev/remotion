import {expect, test} from 'bun:test';
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
	expect(fields).toEqual({
		audioCodec: 'aac',
		durationInSeconds: 5.06667,
	});
});

test('should take a direct stream', async () => {
	const {m3uStreams} = await parseMedia({
		src: 'https://stream.mux.com/MT43ye01xu1301RYUmrpNZeBf800iEWkicKdKLUtUv7TMI.m3u8',
		fields: {
			m3uStreams: true,
		},
		acknowledgeRemotionLicense: true,
	});

	const {dimensions} = await parseMedia({
		src: m3uStreams?.[0]?.url as string,
		acknowledgeRemotionLicense: true,
		fields: {
			dimensions: true,
			tracks: true,
		},
	});

	expect(dimensions).toEqual({
		height: 1000,
		width: 1000,
	});
});
