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
	const {dimensions} = await parseMedia({
		src: 'https://manifest-gcp-us-east1-vop1.fastly.mux.com/YGMjPlHfWgy7lDqN01VVW8zCR200O4o0200R7hnLOO7bV14fLg5ThBx24M3y7fB6eMXudfbnE7THbepACAsY026ZxQ5DVbH6HObW01CMm6HiwEUBI/rendition.m3u8?cdn=fastly&expires=1740484800&skid=default&signature=NjdiZGIwYzBfYjE2MGY5MmJmNDliYmFiZjA0MDYzNDE1NWZlNTNkM2JmYTgyODllNjkxNTEzYmZjOGM3ODcyOGVkMzcwYTczYw==&vsid=iOkl7t01MTAoHf6XOB0265ZOZBLDK5SldqB8zfWW01gqe01t7QG02UXQQ78ZwoVQT23VF02ddtd02rB01Q4',
		acknowledgeRemotionLicense: true,
		fields: {
			dimensions: true,
		},
	});

	expect(dimensions).toEqual({
		height: 720,
		width: 720,
	});
});
