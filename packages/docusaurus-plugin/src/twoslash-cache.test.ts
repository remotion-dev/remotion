import {afterEach, describe, expect, test} from 'bun:test';
import {execFileSync} from 'child_process';
import {mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {pathToFileURL} from 'url';
import {
	createTwoslashCacheContext,
	getTwoslashCacheKey,
	getTwoslashEnvironmentHash,
	getTwoslashLocalCachePath,
	readTwoslashCacheEntry,
	type TwoslashCacheContext,
	writeTwoslashCacheEntry,
} from './twoslash-cache';

const temporaryDirectories: string[] = [];

const versions = {
	twoslash: '1.0.0',
	shiki: '1.0.0',
	typescript: '1.0.0',
	shikiTwoslash: '1.0.0',
};

const makeContext = (root: string): TwoslashCacheContext => ({
	localRoot: join(root, 'node_modules', '.cache', 'twoslash'),
	environmentHash: 'environment-a',
	versions,
	workspacePackages: {},
});

const makeTemporaryDirectory = () => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-twoslash-cache-'));
	temporaryDirectories.push(directory);
	return directory;
};

const makeEnvironmentRepository = ({
	committedLockfile = 'lockfile',
	installedLockfile,
	name,
	packages,
	root,
}: {
	committedLockfile?: string;
	installedLockfile?: string;
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
	writeFileSync(join(repository, 'bun.lock'), committedLockfile, 'utf8');
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
	execFileSync('git', [
		'-C',
		repository,
		'-c',
		'user.name=Test',
		'-c',
		'user.email=test@example.com',
		'commit',
		'--quiet',
		'-m',
		'Initial',
	]);

	if (installedLockfile !== undefined) {
		writeFileSync(join(repository, 'bun.lock'), installedLockfile, 'utf8');
	}

	return docsRoot;
};

const makeRepositoryContext = (docsRoot: string) =>
	createTwoslashCacheContext({docsRoot, versions});

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, {recursive: true, force: true});
	}
});

describe('Twoslash local cache', () => {
	test('reuses unchanged snippets and invalidates only a changed snippet', () => {
		const context = makeContext(makeTemporaryDirectory());
		const firstCode = 'const first = 1;';
		const secondCode = 'const second = 2;';
		const firstKey = getTwoslashCacheKey({
			code: firstCode,
			context,
			lang: 'ts',
		});
		const secondKey = getTwoslashCacheKey({
			code: secondCode,
			context,
			lang: 'ts',
		});

		writeTwoslashCacheEntry({
			context,
			html: '<pre>first</pre>',
			key: firstKey,
		});
		writeTwoslashCacheEntry({
			context,
			html: '<pre>second</pre>',
			key: secondKey,
		});

		expect(readTwoslashCacheEntry({context, key: firstKey})).toBe(
			'<pre>first</pre>',
		);
		const changedFirstKey = getTwoslashCacheKey({
			code: `${firstCode}\nconst changed = true;`,
			context,
			lang: 'ts',
		});
		expect(readTwoslashCacheEntry({context, key: changedFirstKey})).toBeNull();
		expect(readTwoslashCacheEntry({context, key: secondKey})).toBe(
			'<pre>second</pre>',
		);
	});

	test('publishes local entries atomically and rejects empty entries', async () => {
		const root = makeTemporaryDirectory();
		const context = makeContext(root);
		const key = getTwoslashCacheKey({
			code: 'const value = 1;',
			context,
			lang: 'ts',
		});
		const candidates = Array.from(
			{length: 6},
			(_, index) => `<pre>worker-${index}</pre>`,
		);
		const moduleUrl = pathToFileURL(join(__dirname, 'twoslash-cache.ts')).href;
		const script = `
			import {writeTwoslashCacheEntry} from ${JSON.stringify(moduleUrl)};
			writeTwoslashCacheEntry({
				context: JSON.parse(process.env.TWOSLASH_TEST_CONTEXT),
				key: process.env.TWOSLASH_TEST_KEY,
				html: process.env.TWOSLASH_TEST_HTML,
			});
		`;
		const processes = candidates.map((html) =>
			Bun.spawn({
				cmd: [process.execPath, '-e', script],
				env: {
					...process.env,
					TWOSLASH_TEST_CONTEXT: JSON.stringify(context),
					TWOSLASH_TEST_KEY: key,
					TWOSLASH_TEST_HTML: html,
				},
				stderr: 'pipe',
				stdout: 'ignore',
			}),
		);
		expect(
			await Promise.all(processes.map((process) => process.exited)),
		).toEqual(candidates.map(() => 0));

		const cached = readTwoslashCacheEntry({context, key});
		if (cached === null) {
			throw new Error('Expected a local cache entry');
		}

		expect(candidates).toContain(cached);
		expect(
			readdirSync(context.localRoot).filter((file) => file.endsWith('.tmp')),
		).toEqual([]);

		const emptyKey = 'empty';
		writeFileSync(getTwoslashLocalCachePath(context, emptyKey), '', 'utf8');
		expect(readTwoslashCacheEntry({context, key: emptyKey})).toBeNull();
	});
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
		const getAlphaKey = (context: TwoslashCacheContext) =>
			getTwoslashCacheKey({code: alphaCode, context, lang: 'ts'});
		const alphaKey = getAlphaKey(baseline);

		expect(getAlphaKey(unrelatedChange)).toBe(alphaKey);
		expect(getAlphaKey(directChange)).not.toBe(alphaKey);
		expect(getAlphaKey(transitiveChange)).not.toBe(alphaKey);

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

	test('uses the committed lockfile after a Vercel-style install', () => {
		const root = makeTemporaryDirectory();
		const checkout = makeEnvironmentRepository({
			name: 'checkout',
			packages: {},
			root,
		});
		const installedCheckout = makeEnvironmentRepository({
			installedLockfile: 'lockfile rewritten during install',
			name: 'installed-checkout',
			packages: {},
			root,
		});
		const updatedCheckout = makeEnvironmentRepository({
			committedLockfile: 'committed dependency update',
			name: 'updated-checkout',
			packages: {},
			root,
		});

		expect(getTwoslashEnvironmentHash(installedCheckout)).toBe(
			getTwoslashEnvironmentHash(checkout),
		);
		expect(getTwoslashEnvironmentHash(updatedCheckout)).not.toBe(
			getTwoslashEnvironmentHash(checkout),
		);
		const code = 'const value = 1;';
		expect(
			getTwoslashCacheKey({
				code,
				context: makeRepositoryContext(installedCheckout),
				lang: 'ts',
			}),
		).toBe(
			getTwoslashCacheKey({
				code,
				context: makeRepositoryContext(checkout),
				lang: 'ts',
			}),
		);
	});

	test('include the language and Twoslash environment', () => {
		const root = makeTemporaryDirectory();
		const context = makeContext(root);
		const base = getTwoslashCacheKey({
			code: 'const value = 1;',
			lang: 'ts',
			context,
		});
		expect(
			getTwoslashCacheKey({
				code: 'const value = 1;',
				lang: 'tsx',
				context,
			}),
		).not.toBe(base);
		expect(
			getTwoslashCacheKey({
				code: 'const value = 1;',
				lang: 'ts',
				context: {...context, environmentHash: 'environment-b'},
			}),
		).not.toBe(base);
		for (const dependency of Object.keys(
			versions,
		) as (keyof typeof versions)[]) {
			expect(
				getTwoslashCacheKey({
					code: 'const value = 1;',
					lang: 'ts',
					context: {
						...context,
						versions: {...context.versions, [dependency]: '2.0.0'},
					},
				}),
			).not.toBe(base);
		}
	});
});
