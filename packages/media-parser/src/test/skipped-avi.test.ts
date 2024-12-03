import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should skip media data if just wanting header', async () => {
	const {name, size, internalStats} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			name: true,
			size: true,
			internalStats: true,
		},
	});

	expect(name).toEqual('example.avi');
	expect(size).toEqual(742478);
	expect(internalStats).toEqual({
		finalCursorOffset: 12,
		skippedBytes: 742466,
	});
});

test('Should skip media data if just wanting dimensions', async () => {
	const {internalStats, dimensions} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			dimensions: true,
			internalStats: true,
		},
	});

	expect(internalStats).toEqual({
		skippedBytes: 1418372,
		finalCursorOffset: 14600,
	});
	expect(dimensions).toEqual({height: 270, width: 480});
});

test('Should skip if just a video track is requested', async () => {
	const {internalStats, dimensions} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			dimensions: true,
			internalStats: true,
		},
		onVideoTrack: () => {
			return null;
		},
	});

	expect(internalStats).toEqual({
		skippedBytes: 1418372,
		finalCursorOffset: 14600,
	});
	expect(dimensions).toEqual({height: 270, width: 480});
});

test('Should not skip if just a video track is requested', async () => {
	const {internalStats, dimensions, size} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			dimensions: true,
			size: true,
			internalStats: true,
		},
		onVideoTrack: () => {
			return () => undefined;
		},
	});

	expect(internalStats).toEqual({
		skippedBytes: 0,
		finalCursorOffset: size as number,
	});
	expect(dimensions).toEqual({height: 270, width: 480});
	expect(size).toEqual(742478);
});
