import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {isBrowserStudioArtifactPath} from './is-browser-studio-artifact-path';

type PackageJson = {
	readonly name?: string;
	readonly version?: string;
	readonly dependencies?: Record<string, string>;
	readonly workspaces?: {
		readonly catalog?: Record<string, string>;
	};
};

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoDir = join(packageDir, '..', '..');
const nodeOnlyStudioDependencies = new Set(['memfs', 'open']);

const readPackageJson = (path: string): PackageJson =>
	JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;

const getWorkspacePackages = () => {
	const packageJsonGlob = new Bun.Glob('packages/**/package.json');
	const workspacePackages: Record<string, PackageJson> = {};

	for (const packageJsonPath of packageJsonGlob.scanSync({cwd: repoDir})) {
		if (isBrowserStudioArtifactPath(packageJsonPath)) {
			continue;
		}

		const packageJson = readPackageJson(join(repoDir, packageJsonPath));

		if (
			!packageJson.name ||
			!packageJson.version ||
			(packageJson.name !== 'remotion' &&
				!packageJson.name.startsWith('@remotion/'))
		) {
			continue;
		}

		workspacePackages[packageJson.name] = packageJson;
	}

	return workspacePackages;
};

const resolveDependencyVersion = ({
	catalog,
	name,
	spec,
	workspacePackageVersions,
}: {
	readonly catalog: Record<string, string>;
	readonly name: string;
	readonly spec: string;
	readonly workspacePackageVersions: Record<string, string>;
}) => {
	if (spec.startsWith('workspace:')) {
		const workspaceVersion = workspacePackageVersions[name];

		if (!workspaceVersion) {
			throw new Error(`Could not find workspace package version for ${name}`);
		}

		return workspaceVersion;
	}

	if (spec === 'catalog:') {
		const catalogVersion = catalog[name];

		if (!catalogVersion) {
			throw new Error(`Could not find catalog version for ${name}`);
		}

		return catalogVersion;
	}

	return spec;
};

export const getBrowserStudioDependencyVersionsForBuild = (): Record<
	string,
	string
> => {
	const rootPackageJson = readPackageJson(join(repoDir, 'package.json'));
	const studioPackageJson = readPackageJson(
		join(repoDir, 'packages', 'studio', 'package.json'),
	);
	const browserStudioPackageJson = readPackageJson(
		join(repoDir, 'packages', 'browser-studio', 'package.json'),
	);
	const catalog = rootPackageJson.workspaces?.catalog;

	if (!catalog) {
		throw new Error('Could not find root workspace catalog');
	}

	if (!studioPackageJson.name || !studioPackageJson.version) {
		throw new Error('Could not find @remotion/studio package metadata');
	}

	const dependencySpecs: Record<string, string> = {
		'@huggingface/transformers': 'catalog:',
		[studioPackageJson.name]: studioPackageJson.version,
		react: 'catalog:',
		'react-dom': 'catalog:',
		'react-refresh':
			browserStudioPackageJson.dependencies?.['react-refresh'] ?? '0.18.0',
	};

	const workspacePackages = getWorkspacePackages();
	const workspacePackageVersions = Object.fromEntries(
		Object.entries(workspacePackages).map(([name, packageJson]) => [
			name,
			packageJson.version as string,
		]),
	);

	// Third-party dependencies of every workspace package the Studio preview
	// can import must be pinned. Otherwise the fallback bundle requests them as
	// `@latest` from esm.sh, which changes with every upstream release and can
	// fail while esm.sh builds a version that was just published.
	const visitedWorkspacePackages = new Set<string>();
	const workspacePackagesToVisit = [studioPackageJson.name];
	while (workspacePackagesToVisit.length > 0) {
		const workspacePackageName = workspacePackagesToVisit.pop() as string;
		if (visitedWorkspacePackages.has(workspacePackageName)) {
			continue;
		}

		visitedWorkspacePackages.add(workspacePackageName);
		const packageJson =
			workspacePackageName === studioPackageJson.name
				? studioPackageJson
				: workspacePackages[workspacePackageName];
		for (const [name, spec] of Object.entries(
			packageJson?.dependencies ?? {},
		)) {
			if (spec.startsWith('workspace:')) {
				workspacePackagesToVisit.push(name);
				continue;
			}

			if (nodeOnlyStudioDependencies.has(name) || name in dependencySpecs) {
				continue;
			}

			dependencySpecs[name] = spec;
		}
	}

	Object.assign(dependencySpecs, workspacePackageVersions);

	return Object.fromEntries(
		Object.entries(dependencySpecs)
			.map(([name, spec]) => [
				name,
				resolveDependencyVersion({
					catalog,
					name,
					spec,
					workspacePackageVersions,
				}),
			])
			.sort(([left], [right]) => left.localeCompare(right)),
	) as Record<string, string>;
};
