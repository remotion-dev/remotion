import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {IsAGifError, IsAnImageError} from '../errors';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should throw IsAGifError for a gif', () => {
	const prom = parseMedia({
		src: exampleVideos.gif,
		reader: nodeReader,
	});
	expect(prom).rejects.toThrowError(IsAGifError);
});

test('Should throw IsAnImageError for a png', async () => {
	try {
		await parseMedia({
			src: exampleVideos.png,
			reader: nodeReader,
		});
	} catch (e) {
		if (e instanceof IsAnImageError) {
			expect(e.imageType).toBe('png');
			expect(e.dimensions).toEqual({height: 820, width: 820});
			expect(e.mimeType).toEqual(null);
			expect(e.sizeInBytes).toEqual(44183);
			return;
		}
	}

	throw new Error('Expected IsAnImageError');
});

test('Should throw IsAnImageError for a jpeg', async () => {
	try {
		await parseMedia({
			src: exampleVideos.jpeg,
			reader: nodeReader,
		});
	} catch (e) {
		if (e instanceof IsAnImageError) {
			expect(e.imageType).toBe('jpeg');
			expect(e.dimensions).toEqual({height: 400, width: 400});
			expect(e.mimeType).toEqual(null);
			expect(e.sizeInBytes).toEqual(27820);
			return;
		}
	}

	throw new Error('Expected IsAnImageError');
});

test('Should throw IsAnImageError for a bmp', async () => {
	try {
		await parseMedia({
			src: exampleVideos.bmp,
			reader: nodeReader,
		});
	} catch (e) {
		if (e instanceof IsAnImageError) {
			expect(e.imageType).toBe('bmp');
			expect(e.dimensions).toEqual({width: 600, height: 300});
			expect(e.mimeType).toEqual(null);
			expect(e.sizeInBytes).toEqual(540054);
			return;
		}
	}

	throw new Error('Expected IsAnImageError');
});

test('Should throw IsAnImageError for a webp', async () => {
	try {
		await parseMedia({
			src: exampleVideos.webp,
			reader: nodeReader,
		});
	} catch (e) {
		if (e instanceof IsAnImageError) {
			expect(e.imageType).toBe('webp');
			expect(e.dimensions).toEqual({height: 368, width: 550});
			expect(e.mimeType).toEqual(null);
			expect(e.sizeInBytes).toEqual(30320);
			return;
		}

		throw e;
	}
});