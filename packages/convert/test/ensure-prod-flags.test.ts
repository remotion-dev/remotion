import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {REMOTION_PRO_ORIGIN, TEST_FAST} from '~/lib/config';

const readPackageFile = (path: string) => {
	return readFileSync(new URL(path, import.meta.url), 'utf8');
};

test('Should not have convert fast enabled', () => {
	expect(TEST_FAST).toBe(false);
});

test('Should point to production remotion.pro', () => {
	expect(REMOTION_PRO_ORIGIN).toBe('https://www.remotion.pro');
});

test('Should register the ProRes decoder', () => {
	const entryClient = readPackageFile('../app/entry.client.tsx');
	expect(entryClient).toContain(
		"import {registerProresDecoder} from '@mediabunny/prores';",
	);
	expect(entryClient).toContain('registerProresDecoder();');

	const packageJson = JSON.parse(readPackageFile('../package.json')) as {
		dependencies: Record<string, string>;
	};
	expect(packageJson.dependencies['@mediabunny/prores']).toBe('catalog:');
});
