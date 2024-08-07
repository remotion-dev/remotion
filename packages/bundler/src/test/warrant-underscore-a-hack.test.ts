import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import {join} from 'path';

test('Warrant the hack we have in loader.ts ', () => {
	const path = join(process.cwd(), 'dist', 'fast-refresh', 'loader.js');
	const contents = readFileSync(path, 'utf-8');
	expect(contents).toContain('var _a, _b');
});
