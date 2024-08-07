import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';

test('Docs should refer to right pnpm version', () => {
	const root = path.join(__dirname, '..', '..', '..', '..');

	const version = JSON.parse(
		readFileSync(path.join(root, 'package.json'), 'utf-8'),
	).packageManager;

	expect(
		readFileSync(
			path.join(root, 'packages/docs/docs/contributing/index.mdx'),
			'utf-8',
		),
	).toContain(version);
});
