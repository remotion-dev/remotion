import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('WAV file full parse', async () => {
	const {structure} = await parseMedia({
		src: exampleVideos.chirp,
		reader: nodeReader,
		fields: {
			structure: true,
		},
	});
	expect(structure).toEqual({
		type: 'riff',
		boxes: [
			{
				fileSize: 2646142,
				fileType: 'WAVE',
				type: 'riff-header',
			},
			{
				bitsPerSample: 16,
				blockAlign: 2,
				byteRate: 88200,
				formatTag: 1,
				numberOfChannels: 1,
				sampleRate: 44100,
				type: 'wave-format-box',
			},
			{
				id: 'data',
				size: 2646000,
				type: 'riff-box',
			},
			{
				children: [
					{software: 'Lavf60.16.100 (libsndfile-1.0.31)', type: 'isft-box'},
				],
				listType: 'INFO',
				type: 'list-box',
			},
			{
				id: 'id3',
				size: 44,
				type: 'riff-box',
			},
		],
	});
});

test('WAV file should skip over file if only wanting header', async () => {
	const {internalStats} = await parseMedia({
		src: exampleVideos.chirp,
		reader: nodeReader,
		fields: {
			internalStats: true,
		},
	});

	expect(internalStats).toEqual({
		finalCursorOffset: 12,
		skippedBytes: 2646138,
	});
});
