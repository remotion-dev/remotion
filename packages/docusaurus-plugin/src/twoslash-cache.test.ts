import {afterEach, describe, expect, test} from 'bun:test';
import {execFileSync} from 'child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	utimesSync,
	writeFileSync,
} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {pathToFileURL} from 'url';
import {
	createTwoslashCacheContext,
	garbageCollectSharedTwoslashCache,
	getSharedTwoslashCacheRoot,
	getTwoslashCacheKey,
	getTwoslashEnvironmentHash,
	readTwoslashCacheEntry,
	type TwoslashCacheContext,
	writeTwoslashCacheEntry,
} from './twoslash-cache';

const temporaryDirectories: string[] = [];

const makeContext = (
	root: string,
	localName: string,
	environmentHash = 'environment-a',
): TwoslashCacheContext => ({
	localRoot: join(root, localName),
	sharedRoot: join(root, 'shared'),
	environmentHash,
	versions: {
		twoslash: '1.0.0',
		shiki: '1.0.0',
		typescript: '1.0.0',
		shikiTwoslash: '1.0.0',
	},
	workspacePackages: {},
});

const makeTemporaryDirectory = () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-twoslash-cache-'));
	temporaryDirectories.push(directory);
	return directory;
};

const versions = {
	twoslash: '1.0.0',
	shiki: '1.0.0',
	typescript: '1.0.0',
	shikiTwoslash: '1.0.0',
};

const makeEnvironmentRepository = ({
	lockfile = 'lockfile',
	name,
	packages,
	root,
}: {
	lockfile?: string;
	name: string;
	packages: Record<
		string,
		{declaration: string; dependencies?: Record<string, string>}
	>;
	root: string;
}): string => {
	const repository = join(root, name);
	const docsRoot = join(repository, 'packages', 'docs');
	mkdirSync(docsRoot, {recursive: true});
	writeFileSync(join(repository, 'bun.lock'), lockfile, 'utf8');
	writeFileSync(join(repository, 'package.json'), '{}', 'utf8');
	writeFileSync(
		join(docsRoot, 'package.json'),
		JSON.stringify({name: 'docs'}),
		'utf8',
	);

	for (const [packageName, definition] of Object.entries(packages)) {
		const directoryName = packageName.replace('@remotion/', '');
		const packageRoot = join(repository, 'packages', directoryName);
		mkdirSync(join(packageRoot, 'dist'), {recursive: true});
		writeFileSync(
			join(packageRoot, 'package.json'),
			JSON.stringify({
				name: packageName,
				dependencies: definition.dependencies,
			}),
			'utf8',
		);
		writeFileSync(
			join(packageRoot, 'dist', 'index.d.ts'),
			definition.declaration,
			'utf8',
		);
	}

	execFileSync('git', ['init', '--quiet', repository]);
	execFileSync('git', ['-C', repository, 'add', '.']);
	return docsRoot;
};

const makeRepositoryContext = (docsRoot: string) =>
	createTwoslashCacheContext({docsRoot, versions});

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, {recursive: true, force: true});
	}

	delete process.env.TWOSLASH_SHARED_CACHE_GC_INTERVAL_MS;
	delete process.env.TWOSLASH_SHARED_CACHE_MAX_AGE_MS;
});

describe('Twoslash cache keys', () => {
	test('invalidate only snippets affected by workspace declarations', () => {
		const root = makeTemporaryDirectory();
		const makePackages = ({
			alpha = 'export declare const alpha: string;',
			beta = 'export declare const beta: string;',
			shared = 'export declare const shared: string;',
		} = {}) => ({
			'@remotion/alpha': {
				declaration: alpha,
				dependencies: {'@remotion/shared': 'workspace:*'},
			},
			'@remotion/beta': {declaration: beta},
			'@remotion/shared': {declaration: shared},
		});
		const baseline = makeRepositoryContext(
			makeEnvironmentRepository({
				name: 'baseline',
				packages: makePackages(),
				root,
			}),
		);
		const unrelatedChange = makeRepositoryContext(
			makeEnvironmentRepository({
				name: 'unrelated',
				packages: makePackages({
					beta: 'export declare const beta: number;',
				}),
				root,
			}),
		);
		const directChange = makeRepositoryContext(
			makeEnvironmentRepository({
				name: 'direct',
				packages: makePackages({
					alpha: 'export declare const alpha: number;',
				}),
				root,
			}),
		);
		const transitiveChange = makeRepositoryContext(
			makeEnvironmentRepository({
				name: 'transitive',
				packages: makePackages({
					shared: 'export declare const shared: number;',
				}),
				root,
			}),
		);
		const alphaCode = "import {alpha} from '@remotion/alpha';\nalpha;";
		const alphaKey = getTwoslashCacheKey({
			code: alphaCode,
			context: baseline,
			lang: 'ts',
		});
		const getAlphaKey = (context: TwoslashCacheContext) =>
			getTwoslashCacheKey({code: alphaCode, context, lang: 'ts'});

		expect(getAlphaKey(unrelatedChange)).toBe(alphaKey);
		expect(getAlphaKey(directChange)).not.toBe(alphaKey);
		expect(getAlphaKey(transitiveChange)).not.toBe(alphaKey);

		const sharedRoot = join(root, 'selective-shared-cache');
		const baselineCache = {
			...baseline,
			localRoot: join(root, 'baseline-cache'),
			sharedRoot,
		};
		writeTwoslashCacheEntry({
			context: baselineCache,
			html: '<pre>alpha</pre>',
			key: alphaKey,
		});
		expect(
			readTwoslashCacheEntry({
				context: {
					...unrelatedChange,
					localRoot: join(root, 'unrelated-cache'),
					sharedRoot,
				},
				key: getAlphaKey(unrelatedChange),
			}),
		).toBe('<pre>alpha</pre>');
		expect(
			readTwoslashCacheEntry({
				context: {
					...directChange,
					localRoot: join(root, 'direct-cache'),
					sharedRoot,
				},
				key: getAlphaKey(directChange),
			}),
		).toBeNull();

		for (const code of [
			"import type {Alpha} from '@remotion/alpha/subpath';",
			"import '@remotion/alpha';",
			"export {alpha} from '@remotion/alpha';",
			"import('@remotion/alpha');",
			"require('@remotion/alpha');",
			'/// <reference types="@remotion/alpha" />',
		]) {
			expect(
				getTwoslashCacheKey({code, context: directChange, lang: 'ts'}),
			).not.toBe(getTwoslashCacheKey({code, context: baseline, lang: 'ts'}));
		}

		expect(
			getTwoslashCacheKey({
				code: "import {beta} from '@remotion/beta';\nbeta;",
				context: unrelatedChange,
				lang: 'ts',
			}),
		).not.toBe(
			getTwoslashCacheKey({
				code: "import {beta} from '@remotion/beta';\nbeta;",
				context: baseline,
				lang: 'ts',
			}),
		);
		expect(
			getTwoslashCacheKey({
				code: 'const local = 1;',
				context: directChange,
				lang: 'ts',
			}),
		).toBe(
			getTwoslashCacheKey({
				code: 'const local = 1;',
				context: baseline,
				lang: 'ts',
			}),
		);
	});

	test('fingerprint external dependency resolutions globally', () => {
		const root = makeTemporaryDirectory();
		const first = makeEnvironmentRepository({
			name: 'first',
			packages: {},
			root,
		});
		const second = makeEnvironmentRepository({
			lockfile: 'updated lockfile',
			name: 'second',
			packages: {},
			root,
		});

		expect(getTwoslashEnvironmentHash(second)).not.toBe(
			getTwoslashEnvironmentHash(first),
		);
	});

	test('include the language and type environment', () => {
		const root = makeTemporaryDirectory();
		const context = makeContext(root, 'local-a');
		const base = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context,
		});
		const differentLanguage = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'tsx',
			context,
		});
		const differentEnvironment = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context: makeContext(root, 'local-b', 'environment-b'),
		});
		const differentVersions = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context: {
				...context,
				versions: {...context.versions, shikiTwoslash: '2.0.0'},
			},
		});

		expect(differentLanguage).not.toBe(base);
		expect(differentEnvironment).not.toBe(base);
		expect(differentVersions).not.toBe(base);
	});
});

describe('shared Twoslash cache', () => {
	test('uses the same root for all Git worktrees', () => {
		const root = makeTemporaryDirectory();
		const repository = join(root, 'repository');
		const worktree = join(root, 'worktree');
		mkdirSync(repository);
		execFileSync('git', ['init', '--quiet', repository]);
		execFileSync('git', [
			'-C',
			repository,
			'config',
			'user.email',
			'test@example.com',
		]);
		execFileSync('git', ['-C', repository, 'config', 'user.name', 'Test']);
		writeFileSync(join(repository, 'file'), 'content', 'utf8');
		execFileSync('git', ['-C', repository, 'add', 'file']);
		execFileSync('git', [
			'-C',
			repository,
			'commit',
			'--quiet',
			'-m',
			'Initial',
		]);
		execFileSync('git', [
			'-C',
			repository,
			'worktree',
			'add',
			'--quiet',
			'--detach',
			worktree,
		]);

		expect(getSharedTwoslashCacheRoot(worktree)).toBe(
			getSharedTwoslashCacheRoot(repository),
		);
	});

	test('hydrates another worktree and does not replace immutable entries', () => {
		const root = makeTemporaryDirectory();
		const first = makeContext(root, 'local-a');
		const second = makeContext(root, 'local-b');
		const third = makeContext(root, 'local-c');
		const key = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context: first,
		});

		writeTwoslashCacheEntry({context: first, key, html: '<pre>first</pre>'});
		expect(readTwoslashCacheEntry({context: second, key})).toBe(
			'<pre>first</pre>',
		);

		writeTwoslashCacheEntry({context: second, key, html: '<pre>second</pre>'});
		expect(readTwoslashCacheEntry({context: third, key})).toBe(
			'<pre>first</pre>',
		);
	});

	test('publishes one complete entry when processes race', async () => {
		const root = makeTemporaryDirectory();
		const context = makeContext(root, 'local-parent');
		const key = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context,
		});
		const candidates = Array.from(
			{length: 6},
			(_, index) => `<pre>worker-${index}</pre>`,
		);
		const moduleUrl = pathToFileURL(join(__dirname, 'twoslash-cache.ts')).href;
		const script = `
			import {writeTwoslashCacheEntry} from ${JSON.stringify(moduleUrl)};
			const context = JSON.parse(process.env.TWOSLASH_TEST_CONTEXT);
			writeTwoslashCacheEntry({
				context,
				key: process.env.TWOSLASH_TEST_KEY,
				html: process.env.TWOSLASH_TEST_HTML,
			});
		`;
		const processes = candidates.map((html, index) =>
			Bun.spawn({
				cmd: [process.execPath, '-e', script],
				env: {
					...process.env,
					TWOSLASH_TEST_CONTEXT: JSON.stringify({
						...context,
						localRoot: join(root, `local-worker-${index}`),
					}),
					TWOSLASH_TEST_KEY: key,
					TWOSLASH_TEST_HTML: html,
				},
				stderr: 'pipe',
				stdout: 'ignore',
			}),
		);
		const exitCodes = await Promise.all(
			processes.map((process) => process.exited),
		);

		expect(exitCodes).toEqual(candidates.map(() => 0));
		const cached = readTwoslashCacheEntry({
			context: makeContext(root, 'local-reader'),
			key,
		});
		expect(cached).not.toBeNull();
		if (cached === null) {
			throw new Error('Expected a shared cache entry');
		}

		expect(candidates).toContain(cached);
		expect(
			readdirSync(context.sharedRoot!).filter(
				(file) => file.endsWith('.tmp') || file.endsWith('.lock'),
			),
		).toEqual([]);
	});

	test('rejects and repairs corrupt shared entries', () => {
		const root = makeTemporaryDirectory();
		const first = makeContext(root, 'local-a');
		const second = makeContext(root, 'local-b');
		const third = makeContext(root, 'local-c');
		const key = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context: first,
		});
		const sharedPath = join(first.sharedRoot!, `${key}.json`);

		writeTwoslashCacheEntry({context: first, key, html: '<pre>first</pre>'});
		writeFileSync(sharedPath, 'corrupt', 'utf8');
		expect(readTwoslashCacheEntry({context: second, key})).toBeNull();

		writeTwoslashCacheEntry({
			context: second,
			key,
			html: '<pre>repaired</pre>',
		});
		expect(readTwoslashCacheEntry({context: third, key})).toBe(
			'<pre>repaired</pre>',
		);
	});

	test('garbage-collects old shared entries without deleting local entries', () => {
		const root = makeTemporaryDirectory();
		const context = makeContext(root, 'local-a');
		const key = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context,
		});
		const sharedPath = join(context.sharedRoot!, `${key}.json`);
		const localPath = join(context.localRoot, `${key}.json`);

		writeTwoslashCacheEntry({context, key, html: '<pre>cached</pre>'});
		const old = new Date(Date.now() - 10_000);
		utimesSync(sharedPath, old, old);
		process.env.TWOSLASH_SHARED_CACHE_GC_INTERVAL_MS = '0';
		process.env.TWOSLASH_SHARED_CACHE_MAX_AGE_MS = '1';

		garbageCollectSharedTwoslashCache(context);

		expect(existsSync(sharedPath)).toBeFalse();
		expect(readFileSync(localPath, 'utf8')).toBe('<pre>cached</pre>');
	});
});
