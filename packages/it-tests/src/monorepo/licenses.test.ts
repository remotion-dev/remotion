import {expect, test} from 'bun:test';
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {getAllPackages} from './get-all-packages';

test('Published packages must use MIT or reference LICENSE.md', () => {
	const supportedLicenses = ['MIT', 'SEE LICENSE IN LICENSE.md'];
	const invalidPackages: string[] = [];
	let publishedPackages = 0;

	for (const pkg of getAllPackages()) {
		const packageJson = JSON.parse(readFileSync(pkg.path, 'utf-8'));
		if (packageJson.private) {
			continue;
		}

		publishedPackages++;
		if (!supportedLicenses.includes(packageJson.license)) {
			invalidPackages.push(
				`${packageJson.name}: ${JSON.stringify(packageJson.license) ?? 'missing license field'}`,
			);
		}
	}

	expect(publishedPackages).toBeGreaterThan(0);
	if (invalidPackages.length > 0) {
		throw new Error(
			`Published packages must declare one of ${supportedLicenses.join(', ')}:\n${invalidPackages.join('\n')}`,
		);
	}
});

test('Documented package licenses match package.json', () => {
	const packageLicenses = new Map<string, string>();
	for (const pkg of getAllPackages()) {
		const packageJson = JSON.parse(readFileSync(pkg.path, 'utf-8'));
		if (!packageJson.private) {
			packageLicenses.set(packageJson.name, packageJson.license);
		}
	}

	const docsDirectory = path.join(__dirname, '..', '..', '..', 'docs', 'docs');
	const mismatches: string[] = [];
	let checkedLicenses = 0;

	for (const file of readdirSync(docsDirectory, {
		recursive: true,
		encoding: 'utf-8',
	}).sort()) {
		if (!file.endsWith('.mdx')) {
			continue;
		}

		const contents = readFileSync(path.join(docsDirectory, file), 'utf-8');
		for (const [, url] of contents.matchAll(
			/\[Remotion [Ll]icense\]\(([^)]+)\)/g,
		)) {
			if (url !== 'https://remotion.dev/license') {
				mismatches.push(
					`${file}: Remotion License must link to https://remotion.dev/license`,
				);
			}
		}

		if (!/^## License[ \t]*$/m.test(contents)) {
			continue;
		}

		const frontmatter = contents.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
		const title = frontmatter
			?.match(/^title:\s*(.+)$/m)?.[1]
			.trim()
			.replace(/^['"]|['"]$/g, '');
		const packageName =
			title && packageLicenses.has(title)
				? title
				: contents.match(
						/<Installation\s+pkg=['"](remotion|@remotion\/[\w-]+)(?:['"]|\s)/,
					)?.[1];
		if (!packageName || !packageLicenses.has(packageName)) {
			continue;
		}

		const expectedLicense =
			packageLicenses.get(packageName) === 'MIT'
				? 'MIT'
				: '[Remotion License](https://remotion.dev/license)';
		const documentedLicense = contents
			.match(/^## License[ \t]*\r?\n(?:[ \t]*\r?\n)*([^\r\n]+)/m)?.[1]
			.trim();
		checkedLicenses++;
		if (documentedLicense !== expectedLicense) {
			mismatches.push(
				`${file}: expected ${expectedLicense} for ${packageName}`,
			);
		}
	}

	expect(checkedLicenses).toBeGreaterThan(0);
	if (mismatches.length > 0) {
		throw new Error(mismatches.join('\n'));
	}
});
