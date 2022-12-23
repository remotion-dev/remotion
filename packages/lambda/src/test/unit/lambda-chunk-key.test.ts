import {expect, test} from 'vitest';
import {chunkKeyForIndex} from '../../defaults';
import {parseLambdaChunkKey} from '../../shared/parse-chunk-key';

test('Should be able to parse Lambda key', () => {
	expect(
		parseLambdaChunkKey(chunkKeyForIndex({index: 1111, renderId: 'abcdef'}))
	).toEqual({
		chunk: 1111,
		renderId: 'abcdef',
	});
});
