import {execFileSync} from 'child_process';
import {createHash, randomBytes} from 'crypto';
import {
	existsSync,
	linkSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	unlinkSync,
	utimesSync,
	writeFileSync,
} from 'fs';
import {dirname, join, relative, resolve} from 'path';

export const TWOSLASH_CACHE_SCHEMA_VERSION = 3;
export const TWOSLASH_THEME = 'github-dark';
export const TWOSLASH_EXPLICIT_TRIGGER = false;
export const TWOSLASH_RENDERER = 'classic';

const SHARED_CACHE_FILE_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_CACHE_AGE_MS = 90 * DAY_MS;
const DEFAULT_MAX_CACHE_BYTES = 512 * 1024 * 1024;
const DEFAULT_GC_INTERVAL_MS = DAY_MS;

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

export interface TwoslashCacheContext {
	localRoot: string;
	sharedRoot: string | null;
	environmentHash: string;
	versions: TwoslashVersions;
}

interface SharedCacheHeader {
	fileVersion: number;
	key: string;
	contentHash: string;
}

const environmentHashCache = new Map<string, string>();

const isNodeError = (error: unknown, code: string): boolean => {
	return (
		error instanceof Error &&
		'code' in error &&
		(error as NodeJS.ErrnoException).code === code
	);
};

const safeUnlink = (path: string): void => {
	try {
		unlinkSync(path);
	} catch (error) {
		if (!isNodeError(error, 'ENOENT')) {
			throw error;
		}
	}
};

const getTemporaryPath = (path: string): string => {
	return `${path}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
};

const writeFileAtomically = (path: string, contents: string): void => {
	mkdirSync(dirname(path), {recursive: true});
	const temporaryPath = getTemporaryPath(path);
	writeFileSync(temporaryPath, contents, {encoding: 'utf8', flag: 'wx'});

	try {
		renameSync(temporaryPath, path);
	} catch (error) {
		// Another process may have published the same deterministic entry.
		if (!existsSync(path)) {
			throw error;
		}
	} finally {
		if (existsSync(temporaryPath)) {
			safeUnlink(temporaryPath);
		}
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

export const getSharedTwoslashCacheRoot = (cwd: string): string | null => {
	if (process.env.TWOSLASH_SHARED_CACHE_DIR) {
		return resolve(process.env.TWOSLASH_SHARED_CACHE_DIR);
	}

	const gitCommonDir = getGitPath(cwd, '--git-common-dir');
	if (!gitCommonDir) {
		return null;
	}

	return join(
		gitCommonDir,
		'remotion-cache',
		'twoslash',
		`v${TWOSLASH_CACHE_SCHEMA_VERSION}`,
	);
};

const getRepositoryRoot = (docsRoot: string): string => {
	return (
		getGitPath(docsRoot, '--show-toplevel') ?? resolve(docsRoot, '..', '..')
	);
};

const getTrackedEnvironmentFiles = (repositoryRoot: string): string[] => {
	try {
		const output = execFileSync(
			'git',
			[
				'-C',
				repositoryRoot,
				'ls-files',
				'-z',
				'--',
				'bun.lock',
				'package.json',
				':(glob)packages/**/package.json',
				':(glob)packages/**/*.d.ts',
				':(glob)packages/**/*.d.mts',
				':(glob)packages/**/*.d.cts',
			],
			{encoding: 'buffer', maxBuffer: 10 * 1024 * 1024},
		);

		return output.toString('utf8').split('\0').filter(Boolean).sort();
	} catch {
		return ['bun.lock', 'package.json'];
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

	const hash = createHash('sha256');
	const trackedFiles = getTrackedEnvironmentFiles(repositoryRoot);
	const packageDirectories = new Set<string>();

	for (const relativePath of trackedFiles) {
		const absolutePath = join(repositoryRoot, relativePath);
		hashFile(hash, repositoryRoot, absolutePath);
		if (relativePath.endsWith('package.json')) {
			packageDirectories.add(dirname(absolutePath));
		}
	}

	const declarationFiles: string[] = [];
	for (const packageDirectory of packageDirectories) {
		collectDeclarationFiles(join(packageDirectory, 'dist'), declarationFiles);
	}

	for (const declarationFile of declarationFiles.sort()) {
		hashFile(hash, repositoryRoot, declarationFile);
	}

	const digest = hash.digest('hex');
	environmentHashCache.set(repositoryRoot, digest);
	return digest;
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
		sharedRoot: getSharedTwoslashCacheRoot(docsRoot),
		environmentHash: getTwoslashEnvironmentHash(docsRoot),
		versions,
	};
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

const getSharedCachePath = (
	context: TwoslashCacheContext,
	key: string,
): string | null => {
	return context.sharedRoot ? join(context.sharedRoot, `${key}.json`) : null;
};

const serializeSharedCacheEntry = (key: string, html: string): string => {
	const header: SharedCacheHeader = {
		fileVersion: SHARED_CACHE_FILE_VERSION,
		key,
		contentHash: createHash('sha256').update(html).digest('hex'),
	};
	return `${JSON.stringify(header)}\n${html}`;
};

const deserializeSharedCacheEntry = (
	contents: string,
	expectedKey: string,
): string | null => {
	const headerEnd = contents.indexOf('\n');
	if (headerEnd === -1) {
		return null;
	}

	try {
		const header = JSON.parse(
			contents.slice(0, headerEnd),
		) as SharedCacheHeader;
		const html = contents.slice(headerEnd + 1);
		if (
			header.fileVersion !== SHARED_CACHE_FILE_VERSION ||
			header.key !== expectedKey ||
			header.contentHash !== createHash('sha256').update(html).digest('hex')
		) {
			return null;
		}

		return html;
	} catch {
		return null;
	}
};

const readSharedCacheEntry = (path: string, key: string): string | null => {
	try {
		return deserializeSharedCacheEntry(readFileSync(path, 'utf8'), key);
	} catch {
		return null;
	}
};

const touchSharedCacheEntry = (path: string): void => {
	try {
		const stats = statSync(path);
		if (Date.now() - stats.mtimeMs > DAY_MS) {
			const now = new Date();
			utimesSync(path, now, now);
		}
	} catch {
		// Cache maintenance must not fail a docs build.
	}
};

const publishSharedCacheEntry = (
	path: string,
	key: string,
	html: string,
): void => {
	const existing = readSharedCacheEntry(path, key);
	if (existing !== null) {
		touchSharedCacheEntry(path);
		return;
	}

	mkdirSync(dirname(path), {recursive: true});
	const temporaryPath = getTemporaryPath(path);
	writeFileSync(temporaryPath, serializeSharedCacheEntry(key, html), {
		encoding: 'utf8',
		flag: 'wx',
	});

	try {
		if (!existsSync(path)) {
			try {
				// A hard link installs the immutable object without replacing a winner.
				linkSync(temporaryPath, path);
				return;
			} catch (error) {
				if (
					!isNodeError(error, 'EEXIST') &&
					readSharedCacheEntry(path, key) !== null
				) {
					return;
				}
			}
		}

		if (readSharedCacheEntry(path, key) !== null) {
			return;
		}

		// Corrupt entries and filesystems without hard links use a per-key lock
		// before atomically installing the replacement.
		const lockPath = `${path}.lock`;
		try {
			mkdirSync(lockPath);
		} catch {
			return;
		}

		try {
			if (readSharedCacheEntry(path, key) === null) {
				if (existsSync(path)) {
					safeUnlink(path);
				}

				renameSync(temporaryPath, path);
			}
		} finally {
			rmSync(lockPath, {recursive: true, force: true});
		}
	} finally {
		if (existsSync(temporaryPath)) {
			safeUnlink(temporaryPath);
		}
	}
};

export const readTwoslashCacheEntry = ({
	context,
	key,
}: {
	context: TwoslashCacheContext;
	key: string;
}): string | null => {
	const localPath = getTwoslashLocalCachePath(context, key);
	try {
		const localContents = readFileSync(localPath, 'utf8');
		if (localContents.length > 0) {
			return localContents;
		}
	} catch {
		// Fall through to the shared cache.
	}

	const sharedPath = getSharedCachePath(context, key);
	if (!sharedPath) {
		return null;
	}

	const html = readSharedCacheEntry(sharedPath, key);
	if (html === null) {
		return null;
	}

	touchSharedCacheEntry(sharedPath);
	writeFileAtomically(localPath, html);
	return html;
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
	const sharedPath = getSharedCachePath(context, key);
	if (!sharedPath) {
		return;
	}

	try {
		publishSharedCacheEntry(sharedPath, key, html);
	} catch {
		// The local cache is sufficient for this build. A later prewarm can retry
		// publishing to the shared cache.
	}
};

export const publishLocalTwoslashCacheEntry = ({
	context,
	key,
}: {
	context: TwoslashCacheContext;
	key: string;
}): void => {
	const sharedPath = getSharedCachePath(context, key);
	if (!sharedPath) {
		return;
	}

	try {
		const html = readFileSync(getTwoslashLocalCachePath(context, key), 'utf8');
		if (html.length > 0) {
			publishSharedCacheEntry(sharedPath, key, html);
		}
	} catch {
		// Publishing is only an optimization.
	}
};

const readEnvNumber = (name: string, fallback: number): number => {
	const value = process.env[name];
	if (!value) {
		return fallback;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const garbageCollectSharedTwoslashCache = (
	context: TwoslashCacheContext,
): void => {
	if (!context.sharedRoot || !existsSync(context.sharedRoot)) {
		return;
	}

	const now = Date.now();
	const gcIntervalMs = readEnvNumber(
		'TWOSLASH_SHARED_CACHE_GC_INTERVAL_MS',
		DEFAULT_GC_INTERVAL_MS,
	);
	const stampPath = join(context.sharedRoot, '.gc-stamp');
	try {
		if (now - statSync(stampPath).mtimeMs < gcIntervalMs) {
			return;
		}
	} catch {
		// No previous GC stamp.
	}

	const lockPath = join(context.sharedRoot, '.gc-lock');
	try {
		mkdirSync(lockPath);
	} catch {
		try {
			if (now - statSync(lockPath).mtimeMs <= DAY_MS) {
				return;
			}

			rmSync(lockPath, {recursive: true, force: true});
			mkdirSync(lockPath);
		} catch {
			return;
		}
	}

	try {
		const maxAgeMs = readEnvNumber(
			'TWOSLASH_SHARED_CACHE_MAX_AGE_MS',
			DEFAULT_MAX_CACHE_AGE_MS,
		);
		const maxBytes = readEnvNumber(
			'TWOSLASH_SHARED_CACHE_MAX_BYTES',
			DEFAULT_MAX_CACHE_BYTES,
		);
		const entries: {path: string; size: number; mtimeMs: number}[] = [];

		for (const file of readdirSync(context.sharedRoot)) {
			const path = join(context.sharedRoot, file);
			if (file.endsWith('.tmp') || file.endsWith('.lock')) {
				try {
					if (now - statSync(path).mtimeMs > DAY_MS) {
						if (file.endsWith('.lock')) {
							rmSync(path, {recursive: true, force: true});
						} else {
							safeUnlink(path);
						}
					}
				} catch {
					// The file disappeared concurrently.
				}

				continue;
			}

			if (!file.endsWith('.json')) {
				continue;
			}

			try {
				const stats = statSync(path);
				const key = file.slice(0, -'.json'.length);
				if (
					now - stats.mtimeMs > maxAgeMs ||
					readSharedCacheEntry(path, key) === null
				) {
					safeUnlink(path);
					continue;
				}

				entries.push({path, size: stats.size, mtimeMs: stats.mtimeMs});
			} catch {
				// The entry disappeared concurrently.
			}
		}

		let totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
		for (const entry of entries.sort((a, b) => a.mtimeMs - b.mtimeMs)) {
			if (totalBytes <= maxBytes) {
				break;
			}

			try {
				safeUnlink(entry.path);
				totalBytes -= entry.size;
			} catch {
				// Keep going if another process is using or removed the entry.
			}
		}

		writeFileAtomically(stampPath, String(now));
	} catch {
		// Shared cache maintenance must never fail prewarming.
	} finally {
		rmSync(lockPath, {recursive: true, force: true});
	}
};
