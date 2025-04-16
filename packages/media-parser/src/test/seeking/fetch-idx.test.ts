import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {fetchIdx1} from '../../containers/riff/seek/fetch-idx1';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';

test('fetch-idx', async () => {
	const result = await fetchIdx1({
		src: exampleVideos.avi,
		controller: mediaParserController(),
		logLevel: 'verbose',
		position: 0xac246,
		readerInterface: nodeReader,
	});

	console.log(result);
});
