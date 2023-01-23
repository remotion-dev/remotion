import {expect, test} from 'vitest';
import {parsePath} from '../parse-path';
import {translatePath} from '../translate-path';
test('Should be able to parse path', () => {
	const data = parsePath('M10 10 L15 15');

	expect(data).toEqual([
		['M', 10, 10],
		['L', 15, 15],
	]);

	expect(translatePath(data, 10)).toEqual([
		['M', 20, 10],
		['L', 25, 15],
	]);
});
