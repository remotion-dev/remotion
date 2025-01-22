import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {parseAndDownloadMedia} from '../parse-and-download-media';
import {nodeReader} from '../readers/from-node';
import {nodeWriter} from '../writers/node';

test('should be able to parse and download video', async () => {
	await parseAndDownloadMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		writer: nodeWriter('output.avi'),
	});
});
