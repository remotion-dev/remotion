import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {IsAGifError} from '../errors';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should format location data', () => {
	const prom = parseMedia({
		src: exampleVideos.gif,
		reader: nodeReader,
	});
	expect(prom).rejects.toThrowError(IsAGifError);
});
