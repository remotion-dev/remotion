import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {fetchIdx1} from '../../containers/riff/seek/fetch-idx1';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';

test('fetch-idx', async () => {
	const result = await fetchIdx1({
		src: exampleVideos.avi,
		controller: mediaParserController(),
		position: 0xac246,
		readerInterface: nodeReader,
		logLevel: 'info',
	});

	expect(result).toEqual([
		{flags: 16, id: '00dc', offset: 4, size: 4599, index: 0},
		{flags: 16, id: '00dc', offset: 193318, size: 4796, index: 250},
		{flags: 16, id: '00dc', offset: 385260, size: 4651, index: 500},
		{flags: 16, id: '00dc', offset: 570490, size: 4097, index: 750},
	]);
});
