import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should be able to parse only header of MP4', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
		},
		reader: nodeReader,
	});

	expect(parsed.container).toBe('mp4');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: 32,
		skippedBytes: 26326,
	});
});

test('Should be able to parse only tracks of MP4', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
			tracks: true,
		},
		reader: nodeReader,
	});

	expect(parsed.container).toBe('mp4');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: 1621,
		skippedBytes: 24737,
	});
});

test('Should read the whole file', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
			tracks: true,
			structure: true,
		},
		reader: nodeReader,
	});

	expect(parsed.container).toBe('mp4');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: parsed.size as number,
		skippedBytes: 0,
	});
});
