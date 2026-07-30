import {strToU8, zipSync} from 'fflate';
import type {VirtualProject} from './types';

type PackageJson = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	[key: string]: unknown;
};

const dependencyFields = [
	'dependencies',
	'devDependencies',
	'optionalDependencies',
	'peerDependencies',
] as const;

const validateRelativePath = (path: string) => {
	if (path.includes('\0')) {
		throw new Error('Project paths cannot contain null bytes');
	}

	if (path.includes('\\')) {
		throw new Error(`Project paths must use forward slashes: ${path}`);
	}

	if (path.startsWith('/')) {
		throw new Error(`Expected a relative project path, got: ${path}`);
	}

	const segments = path.split('/');
	if (
		segments.length === 0 ||
		segments.some(
			(segment) => segment === '' || segment === '.' || segment === '..',
		)
	) {
		throw new Error(`Invalid project path: ${path}`);
	}

	return path;
};

const normalizeRootDir = (rootDir: string) => {
	if (
		!rootDir.startsWith('/') ||
		rootDir.includes('\\') ||
		rootDir.includes('\0')
	) {
		throw new Error(`Invalid Browser Studio root directory: ${rootDir}`);
	}

	const normalized = rootDir.replace(/\/+$/, '');
	if (!normalized) {
		throw new Error(
			'The Browser Studio root directory cannot be the filesystem root',
		);
	}

	validateRelativePath(normalized.slice(1));
	return normalized;
};

const getProjectFileArchivePath = ({
	path,
	rootDir,
}: {
	path: string;
	rootDir: string;
}) => {
	if (!path.startsWith('/')) {
		return validateRelativePath(path);
	}

	const prefix = `${rootDir}/`;
	if (!path.startsWith(prefix)) {
		throw new Error(`Project file is outside the root directory: ${path}`);
	}

	return validateRelativePath(path.slice(prefix.length));
};

const getPublicFileArchivePath = (path: string) => {
	const relativePath = path.startsWith('/') ? path.slice(1) : path;
	return `public/${validateRelativePath(relativePath)}`;
};

const getPublishedVersion = ({
	name,
	dependencyVersions,
}: {
	name: string;
	dependencyVersions: Record<string, string>;
}) => {
	const version =
		dependencyVersions[name] ??
		(name.startsWith('@remotion/') ? dependencyVersions.remotion : null);

	if (!version) {
		throw new Error(`No published version is known for ${name}`);
	}

	return version;
};

const resolvePortableDependencySpec = ({
	dependencyVersions,
	name,
	spec,
}: {
	dependencyVersions: Record<string, string>;
	name: string;
	spec: string;
}) => {
	if (spec === 'catalog:') {
		return getPublishedVersion({name, dependencyVersions});
	}

	if (!spec.startsWith('workspace:')) {
		return spec;
	}

	const version = getPublishedVersion({name, dependencyVersions});
	const workspaceRange = spec.slice('workspace:'.length);

	if (workspaceRange === '*') {
		return version;
	}

	if (workspaceRange === '^' || workspaceRange === '~') {
		return `${workspaceRange}${version}`;
	}

	throw new Error(
		`Unsupported workspace dependency range for ${name}: ${spec}`,
	);
};

const makeDefaultPackageJson = (
	dependencyVersions: Record<string, string>,
): PackageJson => ({
	name: 'remotion-project',
	version: '1.0.0',
	private: true,
	scripts: {
		dev: 'remotion studio',
	},
	dependencies: {
		'@remotion/cli': getPublishedVersion({
			name: '@remotion/cli',
			dependencyVersions,
		}),
		react: getPublishedVersion({name: 'react', dependencyVersions}),
		'react-dom': getPublishedVersion({
			name: 'react-dom',
			dependencyVersions,
		}),
		remotion: getPublishedVersion({name: 'remotion', dependencyVersions}),
	},
});

const makePortablePackageJson = ({
	contents,
	dependencyVersions,
}: {
	contents: string | undefined;
	dependencyVersions: Record<string, string>;
}) => {
	const packageJson = contents
		? (JSON.parse(contents) as PackageJson)
		: makeDefaultPackageJson(dependencyVersions);

	for (const field of dependencyFields) {
		const dependencies = packageJson[field];
		if (!dependencies) {
			continue;
		}

		packageJson[field] = Object.fromEntries(
			Object.entries(dependencies).map(([name, spec]) => [
				name,
				resolvePortableDependencySpec({
					dependencyVersions,
					name,
					spec,
				}),
			]),
		);
	}

	return `${JSON.stringify(packageJson, null, 2)}\n`;
};

const addArchiveFile = ({
	archiveFiles,
	contents,
	path,
}: {
	archiveFiles: Record<string, Uint8Array>;
	contents: string | Uint8Array;
	path: string;
}) => {
	if (archiveFiles[path]) {
		throw new Error(`Multiple project files resolve to ${path}`);
	}

	archiveFiles[path] =
		typeof contents === 'string' ? strToU8(contents) : contents;
};

export const makeBrowserStudioProjectArchive = ({
	dependencyVersions,
	project,
}: {
	dependencyVersions: Record<string, string>;
	project: VirtualProject;
}) => {
	const rootDir = normalizeRootDir(project.rootDir);
	const archiveFiles: Record<string, Uint8Array> = {};

	for (const [path, contents] of Object.entries(project.files)) {
		addArchiveFile({
			archiveFiles,
			contents,
			path: getProjectFileArchivePath({path, rootDir}),
		});
	}

	for (const [path, contents] of Object.entries(project.publicFiles ?? {})) {
		addArchiveFile({
			archiveFiles,
			contents,
			path: getPublicFileArchivePath(path),
		});
	}

	const packageJsonContents = archiveFiles['package.json'];
	archiveFiles['package.json'] = strToU8(
		makePortablePackageJson({
			contents: packageJsonContents
				? new TextDecoder().decode(packageJsonContents)
				: undefined,
			dependencyVersions,
		}),
	);

	return {
		data: zipSync(archiveFiles, {level: 6}),
		fileName: 'remotion-project.zip',
	};
};
