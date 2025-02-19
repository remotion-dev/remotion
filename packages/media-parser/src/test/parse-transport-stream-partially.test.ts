import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should be able to parse only header of Transport Stream', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.transportstream,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.container).toBe('transport-stream');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: 0,
		skippedBytes: 1913464,
	});
});
test('Should be able to parse only tracks of Transport Stream', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.transportstream,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
			tracks: true,
			durationInSeconds: true,
			fps: true,
			sampleRate: true,
			numberOfAudioChannels: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.container).toBe('transport-stream');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: 80652,
		skippedBytes: 1832812,
	});
	expect(parsed.sampleRate).toBe(48000);
	expect(parsed.numberOfAudioChannels).toBe(2);
});
