import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';

test('@remotion/studio should have zod and mediabunny in dependencies', () => {
	const studioPackageJsonPath = path.resolve(
		__dirname,
		'..',
		'..',
		'..',
		'studio',
		'package.json',
	);

	const json = readFileSync(studioPackageJsonPath, 'utf-8');
	const packageJson = JSON.parse(json);
	const {dependencies} = packageJson;

	expect(dependencies).toBeDefined();
	expect(dependencies.zod).toBeDefined();
	expect(dependencies.mediabunny).toBeDefined();
});
