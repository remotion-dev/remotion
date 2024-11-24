import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('WAV file', async () => {
	const {boxes} = await parseMedia({
		src: exampleVideos.chirp,
		reader: nodeReader,
		fields: {
			boxes: true,
		},
	});
	expect(boxes).toEqual([
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
				{
					id: 'ISFT',
					size: 34,
					type: 'riff-box',
				},
			],
			listType: 'INFO',
			type: 'list-box',
		},
		{
			id: 'id3',
			size: 44,
			type: 'riff-box',
		},
	]);
});
