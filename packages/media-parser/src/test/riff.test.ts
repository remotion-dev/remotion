import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('riff', async () => {
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
			id: 'fmt',
			size: 16,
			type: 'riff-box',
		},
		{
			id: 'data',
			size: 2646000,
			type: 'riff-box',
		},
		{
			id: 'LIST',
			size: 46,
			type: 'riff-box',
		},
		{
			id: 'id3',
			size: 44,
			type: 'riff-box',
		},
	]);
});
