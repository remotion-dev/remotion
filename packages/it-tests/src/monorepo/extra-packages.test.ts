import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';

test('@remotion/studio should have auxiliary modules in dependencies', () => {
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
	expect(dependencies['@huggingface/transformers']).toBe('catalog:');
	expect(dependencies.zod).toBe('catalog:');
	expect(dependencies.mediabunny).toBe('catalog:');
});
