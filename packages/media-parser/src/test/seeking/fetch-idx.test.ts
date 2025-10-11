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
		prefetchCache: new Map(),
		contentLength: 0xac246 + 1_000_000,
	});

	expect(result).toEqual({
		entries: [
			{flags: 16, id: '00dc', offset: 4, size: 4599, sampleCounts: {0: 0}},
			{
				flags: 16,
				id: '00dc',
				offset: 193318,
				size: 4796,
				sampleCounts: {
					'0': 250,
					'1': 392,
				},
			},
			{
				flags: 16,
				id: '00dc',
				offset: 385260,
				size: 4651,
				sampleCounts: {
					'0': 500,
					'1': 783,
				},
			},
			{
				flags: 16,
				id: '00dc',
				offset: 570490,
				size: 4097,
				sampleCounts: {
					'0': 750,
					'1': 1173,
				},
			},
		],
		videoTrackIndex: 0,
	});
});
