import {expect, test} from 'bun:test';
import {readFile} from 'fs/promises';
import path from 'path';

// Just fixating this so we don't break this in the future
test('CJS zip path must be two levels deep', async () => {
	const dist = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'dist',
		'api',
		'deploy-function.js',
	);
	const content = await readFile(dist, 'utf-8');
	expect(content).toContain('../../remotionlambda-arm64.zip');
});

test('ESM zip path must be two levels deep', async () => {
	const dist = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'dist',
		'esm',
		'index.mjs',
	);
	const content = await readFile(dist, 'utf-8');
	expect(content).toContain('../../remotionlambda-arm64.zip');
});
