import {expect, test} from 'bun:test';
import {separateVideoLayers} from '../separate-video-layers';

test('validates public options before reading the input', async () => {
	await expect(
		separateVideoLayers({src: 'unreadable.mp4', audio: 'background' as never}),
	).rejects.toThrow('audio must be one of base, foreground, both, or none.');

	await expect(
		separateVideoLayers({src: 'unreadable.mp4', videoBitrate: 0}),
	).rejects.toThrow('A numeric bitrate must be a positive integer.');

	await expect(
		separateVideoLayers({
			src: 'unreadable.mp4',
			outputs: {
				base: {
					outputTarget: 'arraybuffer',
					outputWritable: new WritableStream(),
				} as never,
			},
		}),
	).rejects.toThrow(
		'outputs.base cannot specify both outputTarget and outputWritable.',
	);

	const controller = new AbortController();
	controller.abort(new Error('stop now'));
	await expect(
		separateVideoLayers({src: 'unreadable.mp4', signal: controller.signal}),
	).rejects.toThrow('stop now');
});
