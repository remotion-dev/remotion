import {readFileSync, existsSync} from 'fs';
import path from 'path';
import {$} from 'bun';

const staged = await $`git diff --cached --name-only --diff-filter=ACMR`.text();
const unstaged = await $`git diff --name-only`.text();
const stagedFiles = staged.trim().split('\n').filter(Boolean);
const changedFiles = [
	...new Set([...stagedFiles, ...unstaged.trim().split('\n')]),
].filter(Boolean);

if (changedFiles.length === 0) {
	process.exit(0);
}

const formatPackageNames = new Set<string>();
const lintPackageNames = new Set<string>();

for (const file of changedFiles) {
	const match = file.match(/^packages\/([^/]+)\//);
	if (!match) {
		continue;
	}

	const dir = match[1];
	const pkgJsonPath = path.join('packages', dir, 'package.json');

	if (!existsSync(pkgJsonPath)) {
		continue;
	}

	const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

	if (pkgJson.scripts?.format) {
		formatPackageNames.add(pkgJson.name);
	}

	if (pkgJson.scripts?.lint) {
		lintPackageNames.add(pkgJson.name);
	}
}

if (formatPackageNames.size > 0) {
	const formatFilters = [...formatPackageNames].flatMap((name) => [
		'--filter',
		name,
	]);
	await $`bun run ${formatFilters} format`;

	// Re-stage originally staged files so formatting changes are included in this commit
	if (stagedFiles.length > 0) {
		await $`git add ${stagedFiles}`;
	}
}

if (lintPackageNames.size > 0) {
	const lintFilters = [...lintPackageNames].flatMap((name) => [
		'--filter',
		name,
	]);
	await $`bun run ${lintFilters} lint`;
}
