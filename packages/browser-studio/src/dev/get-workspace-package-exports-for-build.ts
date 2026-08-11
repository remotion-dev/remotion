import {readFileSync} from 'node:fs';
import {dirname, join, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {BrowserStudioWorkspacePackageExports} from '../workspace-package-exports';

type ConditionalExport = {
	readonly default?: string;
	readonly import?: string;
	readonly module?: string;
};

type PackageJson = {
	readonly exports?: Record<string, string | ConditionalExport>;
	readonly name?: string;
};

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoDir = join(packageDir, '..', '..');

const readPackageJson = (path: string): PackageJson =>
	JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;

const getBrowserExport = (value: string | ConditionalExport) => {
	if (typeof value === 'string') {
		return value;
	}

	return value.module ?? value.import ?? value.default ?? null;
};

export const getBrowserStudioWorkspacePackageExportsForBuild =
	(): BrowserStudioWorkspacePackageExports => {
		const packageJsonGlob = new Bun.Glob('packages/**/package.json');
		const packages: BrowserStudioWorkspacePackageExports = {};

		for (const packageJsonPath of packageJsonGlob.scanSync({cwd: repoDir})) {
			const absolutePackageJsonPath = join(repoDir, packageJsonPath);
			const packageJson = readPackageJson(absolutePackageJsonPath);
			if (
				!packageJson.name ||
				(packageJson.name !== 'remotion' &&
					!packageJson.name.startsWith('@remotion/'))
			) {
				continue;
			}

			const browserExports = Object.fromEntries(
				Object.entries(packageJson.exports ?? {}).flatMap(
					([subpath, value]) => {
						const target = getBrowserExport(value);
						return target ? [[subpath, target]] : [];
					},
				),
			);
			if (Object.keys(browserExports).length === 0) {
				continue;
			}

			packages[packageJson.name] = {
				exports: browserExports,
				packageRoot: relative(repoDir, dirname(absolutePackageJsonPath))
					.split(sep)
					.join('/'),
			};
		}

		return Object.fromEntries(
			Object.entries(packages).sort(([left], [right]) =>
				left.localeCompare(right),
			),
		);
	};
