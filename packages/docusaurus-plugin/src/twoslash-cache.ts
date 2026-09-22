import {execFileSync} from 'child_process';
import {createHash, randomBytes} from 'crypto';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'fs';
import {dirname, join, relative, resolve} from 'path';

export const TWOSLASH_CACHE_SCHEMA_VERSION = 2;
export const TWOSLASH_THEME = 'github-dark';
export const TWOSLASH_EXPLICIT_TRIGGER = false;
export const TWOSLASH_RENDERER = 'classic';

export const getTwoslashCompilerOptions = () => ({
	types: ['node'],
	target: 99 /* ESNext */,
	module: 99 /* ESNext */,
	jsx: 4 /* ReactJSX */,
	skipLibCheck: true,
});

export interface TwoslashVersions {
	twoslash: string;
	shiki: string;
	typescript: string;
	shikiTwoslash: string;
}

interface TwoslashWorkspacePackage {
	dependencies: string[];
	declarationHash: string;
}

export interface TwoslashCacheContext {
	localRoot: string;
	environmentHash: string;
	versions: TwoslashVersions;
	workspacePackages: Record<string, TwoslashWorkspacePackage>;
}

const environmentHashCache = new Map<string, string>();

const writeFileAtomically = (path: string, contents: string): void => {
	mkdirSync(dirname(path), {recursive: true});
	const temporaryPath = `${path}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
	writeFileSync(temporaryPath, contents, {encoding: 'utf8', flag: 'wx'});

	try {
		renameSync(temporaryPath, path);
	} catch (error) {
		// Another process may have published the same deterministic entry.
		if (!existsSync(path)) {
			throw error;
		}
	} finally {
		rmSync(temporaryPath, {force: true});
	}
};

const findPackageVersion = (
	packageName: string,
	resolvePackage: (packageName: string) => string,
): string => {
	let currentDir = dirname(resolvePackage(packageName));

	while (true) {
		const packageJsonPath = join(currentDir, 'package.json');
		if (existsSync(packageJsonPath)) {
			const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
				version?: string;
			};
			if (packageJson.version) {
				return packageJson.version;
			}
		}

		const parent = dirname(currentDir);
		if (parent === currentDir) {
			return 'unknown';
		}

		currentDir = parent;
	}
};

export const getTwoslashVersions = (
	resolvePackage: (packageName: string) => string,
): TwoslashVersions => {
	return {
		twoslash: findPackageVersion('twoslash', resolvePackage),
		shiki: findPackageVersion('shiki', resolvePackage),
		typescript: findPackageVersion('typescript', resolvePackage),
		shikiTwoslash: findPackageVersion('@shikijs/twoslash', resolvePackage),
	};
};

const getGitPath = (cwd: string, argument: string): string | null => {
	try {
		return execFileSync(
			'git',
			['-C', cwd, 'rev-parse', '--path-format=absolute', argument],
			{encoding: 'utf8'},
		).trim();
	} catch {
		return null;
	}
};

const getRepositoryRoot = (docsRoot: string): string => {
	return (
		getGitPath(docsRoot, '--show-toplevel') ?? resolve(docsRoot, '..', '..')
	);
};

const getTrackedPackageJsonFiles = (repositoryRoot: string): string[] => {
	try {
		const output = execFileSync(
			'git',
			[
				'-C',
				repositoryRoot,
				'ls-files',
				'-z',
				'--',
				':(glob)packages/**/package.json',
			],
			{encoding: 'buffer', maxBuffer: 10 * 1024 * 1024},
		);

		return output.toString('utf8').split('\0').filter(Boolean).sort();
	} catch {
		return [];
	}
};

const collectDeclarationFiles = (directory: string, output: string[]): void => {
	if (!existsSync(directory)) {
		return;
	}

	for (const entry of readdirSync(directory, {withFileTypes: true})) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			collectDeclarationFiles(path, output);
		} else if (/\.d\.(?:ts|mts|cts)$/.test(entry.name)) {
			output.push(path);
		}
	}
};

const hashFile = (
	hash: ReturnType<typeof createHash>,
	repositoryRoot: string,
	path: string,
): void => {
	const relativePath = relative(repositoryRoot, path);
	hash.update(relativePath);
	hash.update('\0');
	if (existsSync(path)) {
		hash.update(readFileSync(path, 'utf8'));
	} else {
		hash.update('<missing>');
	}

	hash.update('\0');
};

export const getTwoslashEnvironmentHash = (docsRoot: string): string => {
	const repositoryRoot = getRepositoryRoot(docsRoot);
	const cached = environmentHashCache.get(repositoryRoot);
	if (cached) {
		return cached;
	}

	// External package resolutions can affect any snippet. Hash the committed
	// lockfile so an install-time rewrite cannot invalidate restored cache entries.
	const hash = createHash('sha256');
	hash.update('bun.lock\0');
	try {
		hash.update(
			execFileSync('git', ['-C', repositoryRoot, 'show', 'HEAD:bun.lock'], {
				encoding: 'utf8',
				maxBuffer: 100 * 1024 * 1024,
			}),
		);
	} catch {
		const lockfile = join(repositoryRoot, 'bun.lock');
		hash.update(
			existsSync(lockfile) ? readFileSync(lockfile, 'utf8') : '<missing>',
		);
	}

	const digest = hash.digest('hex');
	environmentHashCache.set(repositoryRoot, digest);
	return digest;
};

const getTwoslashWorkspacePackages = (
	docsRoot: string,
): Record<string, TwoslashWorkspacePackage> => {
	const repositoryRoot = getRepositoryRoot(docsRoot);
	const packages: Record<string, TwoslashWorkspacePackage> = {};

	for (const relativePackageJsonPath of getTrackedPackageJsonFiles(
		repositoryRoot,
	)) {
		const packageJsonPath = join(repositoryRoot, relativePackageJsonPath);
		const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
			name?: string;
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
			optionalDependencies?: Record<string, string>;
			peerDependencies?: Record<string, string>;
		};
		if (!packageJson.name) {
			continue;
		}

		const packageDirectory = dirname(packageJsonPath);
		const declarationFiles: string[] = [];
		collectDeclarationFiles(join(packageDirectory, 'dist'), declarationFiles);
		const hash = createHash('sha256');
		hashFile(hash, repositoryRoot, packageJsonPath);
		for (const declarationFile of declarationFiles.sort()) {
			hashFile(hash, repositoryRoot, declarationFile);
		}

		packages[packageJson.name] = {
			declarationHash: hash.digest('hex'),
			dependencies: [
				...Object.keys(packageJson.dependencies ?? {}),
				...Object.keys(packageJson.devDependencies ?? {}),
				...Object.keys(packageJson.optionalDependencies ?? {}),
				...Object.keys(packageJson.peerDependencies ?? {}),
			].sort(),
		};
	}

	return packages;
};

export const createTwoslashCacheContext = ({
	docsRoot,
	versions,
}: {
	docsRoot: string;
	versions: TwoslashVersions;
}): TwoslashCacheContext => {
	return {
		localRoot: join(docsRoot, 'node_modules', '.cache', 'twoslash'),
		environmentHash: getTwoslashEnvironmentHash(docsRoot),
		versions,
		workspacePackages: getTwoslashWorkspacePackages(docsRoot),
	};
};

const getWorkspacePackageName = (specifier: string): string => {
	const parts = specifier.split('/');
	return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

const getImportedWorkspacePackageHashes = (
	code: string,
	workspacePackages: Record<string, TwoslashWorkspacePackage>,
): string[] => {
	const importedPackages = new Set<string>();
	const importRegex =
		/(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]|(?:import|require)\(\s*['"]([^'"]+)['"]\s*\)|\/\/\/\s*<reference\s+types=['"]([^'"]+)['"]/g;
	for (const match of code.matchAll(importRegex)) {
		const specifier = match[1] ?? match[2] ?? match[3];
		if (specifier.startsWith('.') || specifier.startsWith('/')) {
			continue;
		}

		const packageName = getWorkspacePackageName(specifier);
		if (workspacePackages[packageName]) {
			importedPackages.add(packageName);
		}
	}

	const packageClosure = new Set<string>();
	const visitPackage = (packageName: string) => {
		if (packageClosure.has(packageName)) {
			return;
		}

		const workspacePackage = workspacePackages[packageName];
		if (!workspacePackage) {
			return;
		}

		packageClosure.add(packageName);
		for (const dependency of workspacePackage.dependencies) {
			visitPackage(dependency);
		}
	};

	for (const packageName of importedPackages) {
		visitPackage(packageName);
	}

	return [...packageClosure]
		.sort()
		.map(
			(packageName) =>
				`${packageName}:${workspacePackages[packageName].declarationHash}`,
		);
};

export const getTwoslashCacheKey = ({
	code,
	lang,
	context,
}: {
	code: string;
	lang: string;
	context: TwoslashCacheContext;
}): string => {
	return createHash('sha256')
		.update(
			JSON.stringify({
				schemaVersion: TWOSLASH_CACHE_SCHEMA_VERSION,
				code,
				lang,
				theme: TWOSLASH_THEME,
				compilerOptions: getTwoslashCompilerOptions(),
				transformer: {
					renderer: TWOSLASH_RENDERER,
					explicitTrigger: TWOSLASH_EXPLICIT_TRIGGER,
				},
				versions: context.versions,
				environmentHash: context.environmentHash,
				workspacePackages: getImportedWorkspacePackageHashes(
					code,
					context.workspacePackages,
				),
			}),
		)
		.digest('hex');
};

export const getTwoslashLocalCachePath = (
	context: TwoslashCacheContext,
	key: string,
): string => {
	return join(context.localRoot, `${key}.json`);
};

export const readTwoslashCacheEntry = ({
	context,
	key,
}: {
	context: TwoslashCacheContext;
	key: string;
}): string | null => {
	try {
		const contents = readFileSync(
			getTwoslashLocalCachePath(context, key),
			'utf8',
		);
		return contents.length > 0 ? contents : null;
	} catch {
		return null;
	}
};

export const writeTwoslashCacheEntry = ({
	context,
	key,
	html,
}: {
	context: TwoslashCacheContext;
	key: string;
	html: string;
}): void => {
	writeFileAtomically(getTwoslashLocalCachePath(context, key), html);
};
