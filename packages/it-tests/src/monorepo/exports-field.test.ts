import {test} from 'bun:test';
import {existsSync, lstatSync, readdirSync, readFileSync} from 'fs';
import path from 'path';

test('All packages should export package.json', () => {
	const packages = readdirSync(path.join(process.cwd(), '..'));
	const folders = packages.filter((p) =>
		lstatSync(path.join(process.cwd(), '..', p)).isDirectory(),
	);

	for (const folder of folders) {
		const packageJsonPath = path.join(
			process.cwd(),
			'..',
			folder,
			'package.json',
		);
		if (!existsSync(packageJsonPath)) {
			continue;
		}
		const json = readFileSync(packageJsonPath, 'utf-8');
		const packageJson = JSON.parse(json);
		const {exports} = packageJson;
		if (exports === undefined) {
			continue;
		}
		if (!exports['./package.json']) {
			throw new Error('No package.json export in ' + folder);
		}
	}
});
