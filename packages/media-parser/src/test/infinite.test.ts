import {test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('makea  test', async () => {
	await parseMedia({
		src: '/Users/jonathanburger/Downloads/1ea6a61d-023d-4bfc-b06a-2c80fc43edf8.mov',
		reader: nodeReader,
		logLevel: 'trace',
		onVideoTrack: () => {
			return (sample) => {
				console.log(sample.timestamp / sample.timescale);
			};
		},
	});
});
