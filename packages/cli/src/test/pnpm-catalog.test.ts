import {describe, expect, test} from 'bun:test';
import {
	getPackagesCatalogRefs,
	parseCatalogPackagesFromYaml,
	updateCatalogVersionInYaml,
} from '../pnpm-catalog';

describe('parseCatalogPackagesFromYaml', () => {
	test('parses default catalog', () => {
		const yaml = `
packages:
  - 'packages/*'
catalog:
  remotion: ^4.0.0
  '@remotion/cli': ^4.0.0
  "@remotion/player": ^4.0.0
`.trim();

		const result = parseCatalogPackagesFromYaml(yaml);
		expect(result.remotion).toBe('');
		expect(result['@remotion/cli']).toBe('');
		expect(result['@remotion/player']).toBe('');
	});

	test('parses named catalogs', () => {
		const yaml = `
catalogs:
  cat1:
    remotion: ^4.0.0
    '@remotion/cli': ^4.0.0
  cat2:
    '@remotion/player': ^4.0.0
`.trim();

		const result = parseCatalogPackagesFromYaml(yaml);
		expect(result.remotion).toBe('cat1');
		expect(result['@remotion/cli']).toBe('cat1');
		expect(result['@remotion/player']).toBe('cat2');
	});

	test('parses both default and named catalogs', () => {
		const yaml = `
catalog:
  remotion: ^4.0.0
catalogs:
  extra:
    '@remotion/cli': ^4.0.0
`.trim();

		const result = parseCatalogPackagesFromYaml(yaml);
		expect(result.remotion).toBe('');
		expect(result['@remotion/cli']).toBe('extra');
	});

	test('returns empty object for no catalog', () => {
		const yaml = `
packages:
  - 'packages/*'
`.trim();

		const result = parseCatalogPackagesFromYaml(yaml);
		expect(Object.keys(result)).toHaveLength(0);
	});
});

describe('updateCatalogVersionInYaml', () => {
	test('updates a package in the default catalog', () => {
		const yaml = `catalog:
  remotion: ^4.0.0
  '@remotion/cli': ^4.0.0`;

		const result = updateCatalogVersionInYaml(yaml, 'remotion', '4.1.0', '');
		expect(result).toContain('remotion: 4.1.0');
		expect(result).toContain("'@remotion/cli': ^4.0.0");
	});

	test('updates a scoped package in the default catalog', () => {
		const yaml = `catalog:
  remotion: ^4.0.0
  '@remotion/cli': ^4.0.0`;

		const result = updateCatalogVersionInYaml(
			yaml,
			'@remotion/cli',
			'4.1.0',
			'',
		);
		expect(result).toContain('remotion: ^4.0.0');
		expect(result).toContain("'@remotion/cli': 4.1.0");
	});

	test('updates a package in a named catalog', () => {
		const yaml = `catalogs:
  cat1:
    remotion: ^4.0.0
    '@remotion/cli': ^4.0.0
  cat2:
    '@remotion/player': ^4.0.0`;

		const result = updateCatalogVersionInYaml(
			yaml,
			'@remotion/player',
			'4.1.0',
			'cat2',
		);
		expect(result).toContain("'@remotion/player': 4.1.0");
		expect(result).toContain('remotion: ^4.0.0');
	});

	test('does not modify packages not in the target catalog', () => {
		const yaml = `catalogs:
  cat1:
    remotion: ^4.0.0
  cat2:
    remotion: ^3.0.0`;

		const result = updateCatalogVersionInYaml(
			yaml,
			'remotion',
			'4.1.0',
			'cat1',
		);
		// cat1 version should be updated
		const lines = result.split('\n');
		const cat1Line = lines.findIndex((l) => l.includes('cat1:'));
		const cat2Line = lines.findIndex((l) => l.includes('cat2:'));
		expect(lines[cat1Line + 1]).toContain('remotion: 4.1.0');
		expect(lines[cat2Line + 1]).toContain('remotion: ^3.0.0');
	});

	test('preserves unrelated content', () => {
		const yaml = `packages:
  - 'packages/*'
catalog:
  remotion: ^4.0.0`;

		const result = updateCatalogVersionInYaml(yaml, 'remotion', '4.1.0', '');
		expect(result).toContain('packages:');
		expect(result).toContain("  - 'packages/*'");
		expect(result).toContain('remotion: 4.1.0');
	});
});

describe('getPackagesCatalogRefs', () => {
	test('returns catalog refs for packages using catalog:', () => {
		const packageJson = {
			dependencies: {
				remotion: 'catalog:',
				'@remotion/cli': 'catalog:',
			},
			devDependencies: {
				'@remotion/player': 'catalog:extra',
			},
		};

		const result = getPackagesCatalogRefs(packageJson, [
			'remotion',
			'@remotion/cli',
			'@remotion/player',
		]);

		expect(result.remotion).toBe('');
		expect(result['@remotion/cli']).toBe('');
		expect(result['@remotion/player']).toBe('extra');
	});

	test('ignores packages not using catalog:', () => {
		const packageJson = {
			dependencies: {
				remotion: '^4.0.0',
				'@remotion/cli': 'catalog:',
			},
		};

		const result = getPackagesCatalogRefs(packageJson, [
			'remotion',
			'@remotion/cli',
		]);

		expect(result.remotion).toBeUndefined();
		expect(result['@remotion/cli']).toBe('');
	});

	test('returns empty object when no catalog: entries', () => {
		const packageJson = {
			dependencies: {
				remotion: '^4.0.0',
			},
		};

		const result = getPackagesCatalogRefs(packageJson, ['remotion']);
		expect(Object.keys(result)).toHaveLength(0);
	});
});
