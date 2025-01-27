import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should skip media data if just wanting header', async () => {
	const {name, size, internalStats, container} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			name: true,
			size: true,
			internalStats: true,
			container: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(name).toEqual('example.avi');
	expect(size).toEqual(742478);
	expect(internalStats).toEqual({
		finalCursorOffset: 12,
		skippedBytes: 742466,
	});
	expect(container).toEqual('avi');
});

test('Should skip media data if just wanting dimensions', async () => {
	const {internalStats, dimensions} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			dimensions: true,
			internalStats: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(internalStats).toEqual({
		finalCursorOffset: 8914,
		skippedBytes: 733564,
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
		acknowledgeRemotionLicense: true,
	});

	expect(internalStats).toEqual({
		finalCursorOffset: 14592,
		skippedBytes: 727886,
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
		acknowledgeRemotionLicense: true,
	});

	expect(internalStats).toEqual({
		skippedBytes: 0,
		finalCursorOffset: size as number,
	});
	expect(dimensions).toEqual({height: 270, width: 480});
	expect(size).toEqual(742478);
});
