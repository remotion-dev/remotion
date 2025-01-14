import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should read MP3 file', async () => {
	const {tracks} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			tracks: true,
		},
	});

	console.log(tracks);
});
