import {readFileSync} from 'fs';
import {join} from 'path';
import {expect, test} from 'vitest';

test('Warrant the hack we have in loader.ts ', () => {
	const path = join(process.cwd(), 'dist', 'fast-refresh', 'loader.js');
	const contents = readFileSync(path, 'utf-8');
	expect(contents).toContain('var _a, _b');
});
