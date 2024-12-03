import {exampleVideos} from '@remotion/example-videos';
import {nodeReader} from '@remotion/media-parser/node';
import {expect, test} from 'bun:test';
import {convertMedia} from '../convert-media';

test('Convert AVI to MP4', async () => {
	const output = await convertMedia({
		src: exampleVideos.avi,
		container: 'mp4',
		reader: nodeReader,
	});
	const f = await output.save();
	expect(f.size).toBeGreaterThan(0);
});
