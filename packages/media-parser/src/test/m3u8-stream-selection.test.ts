import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('m3u8 stream selection 1', async () => {
	let called = false;
	const {dimensions} = await parseMedia({
		src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		fields: {
			dimensions: true,
		},
		selectM3uStream: ({streams}) => {
			called = true;
			expect(streams[1].resolution?.width).toBe(1280);
			expect(streams[1].resolution?.height).toBe(720);
			return streams[1].id;
		},
		acknowledgeRemotionLicense: true,
	});

	expect(called).toBe(true);
	expect(dimensions).toEqual({width: 1280, height: 720});
});

test('m3u8 stream selection 2', () => {
	expect(() => {
		return parseMedia({
			src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
			fields: {
				dimensions: true,
			},
			selectM3uStream: () => {
				return 9999;
			},
			acknowledgeRemotionLicense: true,
		});
	}).toThrow('No stream with the id 9999 found');
});
