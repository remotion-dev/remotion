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
			return;
		}
	}

	throw new Error('Expected IsAnImageError');
});
