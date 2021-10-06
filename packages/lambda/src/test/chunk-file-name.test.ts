import {chunkKeyWithEmbeddedTiming} from '../defaults';
import {parseChunkTimingsKey} from '../shared/parse-chunk-timing-key';

const EXPECTED =
	'renders/8dakdd/chunks/chunk:00000088-start:1625579377044-end:1625579387219';

test('Should be able to convert back to object', () => {
	expect(parseChunkTimingsKey(EXPECTED)).toEqual({
		chunk: 88,
		start: 1625579377044,
		end: 1625579387219,
		renderId: '8dakdd',
	});
});

test('Should give expected file name', () => {
	expect(
		chunkKeyWithEmbeddedTiming({
			index: 88,
			start: 1625579377044,
			end: 1625579387219,
			renderId: '8dakdd',
		})
	).toBe(EXPECTED);
});
