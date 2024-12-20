import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

// ISO Base media is tested elsewhere

test('should be able to get keyframes from webm', async () => {
	const {keyframes, internalStats} = await parseMedia({
		src: exampleVideos.stretchedVp8,
		fields: {
			keyframes: true,
			internalStats: true,
		},
		reader: nodeReader,
	});
	expect(keyframes).toEqual([
		{
			trackId: 1,
			decodingTimeInSeconds: 0.003,
			positionInBytes: 4562,
			presentationTimeInSeconds: 0.003,
			sizeInBytes: 321332,
		},
		{
			trackId: 1,
			decodingTimeInSeconds: 4.803,
			positionInBytes: 5081929,
			presentationTimeInSeconds: 4.803,
			sizeInBytes: 197957,
		},
		{
			trackId: 1,
			decodingTimeInSeconds: 9.603,
			positionInBytes: 10318915,
			presentationTimeInSeconds: 9.603,
			sizeInBytes: 220690,
		},
	]);
	expect(internalStats).toEqual({
		finalCursorOffset: 13195359,
		skippedBytes: 0,
	});
});

test('should be able to get keyframes from avi', async () => {
	const {keyframes, internalStats} = await parseMedia({
		src: exampleVideos.avi,
		fields: {
			keyframes: true,
			internalStats: true,
		},
		reader: nodeReader,
	});
	expect(keyframes).toEqual([
		{
			decodingTimeInSeconds: 0,
			positionInBytes: 9992,
			presentationTimeInSeconds: 0,
			sizeInBytes: 4599,
			trackId: 0,
		},
		{
			decodingTimeInSeconds: 8.333333333333334,
			positionInBytes: 203306,
			presentationTimeInSeconds: 8.333333333333334,
			sizeInBytes: 4796,
			trackId: 0,
		},
		{
			decodingTimeInSeconds: 16.666666666666668,
			positionInBytes: 395248,
			presentationTimeInSeconds: 16.666666666666668,
			sizeInBytes: 4651,
			trackId: 0,
		},
		{
			decodingTimeInSeconds: 25,
			positionInBytes: 580478,
			presentationTimeInSeconds: 25,
			sizeInBytes: 4097,
			trackId: 0,
		},
	]);
	expect(internalStats).toEqual({
		finalCursorOffset: 742478,
		skippedBytes: 0,
	});
});

test('should be able to get keyframes from .ts', async () => {
	const {keyframes, internalStats} = await parseMedia({
		src: exampleVideos.transportstream,
		fields: {
			keyframes: true,
			internalStats: true,
		},
		reader: nodeReader,
	});
	expect(keyframes).toEqual([
		{
			decodingTimeInSeconds: 10,
			positionInBytes: 564,
			presentationTimeInSeconds: 10.033333333333333,
			sizeInBytes: 23814,
			trackId: 256,
		},
	]);
	expect(internalStats).toEqual({
		finalCursorOffset: 1913464,
		skippedBytes: 0,
	});
});
