import {exampleVideos} from '@remotion/example-videos';
import {nodeReader} from '@remotion/media-parser/node';
import {nodeWriter} from '@remotion/media-parser/node-writer';
import {expect, test} from 'bun:test';
import {unlinkSync} from 'node:fs';
import {convertMedia} from '../convert-media';

test('should be able to remux server side', async () => {
	// bun file descriptor problem
	if (process.platform === 'win32') {
		return;
	}

	const {save} = await convertMedia({
		src: exampleVideos.bigBuckBunny,
		reader: nodeReader,
		container: 'mp4',
		writer: nodeWriter('outputbun.mp4'),
	});

	const data = await save();
	expect(data.size).toBe(16330323);
	unlinkSync('outputbun.mp4');
});
