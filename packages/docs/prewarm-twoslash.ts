import type {ChildProcessWithoutNullStreams} from 'child_process';
import {spawn} from 'child_process';
import {createHash} from 'crypto';
import {existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync} from 'fs';
import {createRequire} from 'module';
import {availableParallelism, cpus, totalmem} from 'os';
import {dirname, join, resolve} from 'path';
import {createInterface} from 'readline';
import {Glob} from 'bun';
import {expandElementSourceReferences} from './plugins/element-source-utils';

const DOCS_ROOT = resolve(import.meta.dirname);
const CACHE_ROOT = join(DOCS_ROOT, 'node_modules', '.cache', 'twoslash');
const WORKER_SOURCE_PATH = join(DOCS_ROOT, 'twoslash-worker.mjs');
const WORKER_PATH = join(
	DOCS_ROOT,
	'node_modules',
	'.cache',
	'twoslash-worker-bundle.mjs',
);

const GIB = 1024 * 1024 * 1024;
const cpuCount =
	typeof availableParallelism === 'function'
		? availableParallelism()
		: cpus().length;
const cpuCap = Math.max(1, cpuCount - 1);
// Each worker holds a TypeScript language service that can grow to >1GB.
// Cap the worker count so the combined RSS leaves room for the OS and
// other processes on low-memory machines.
const memCap = Math.max(1, Math.floor((totalmem() - 4 * GIB) / (1.25 * GIB)));
const workerCountOverride = process.env.TWOSLASH_WORKER_COUNT
	? parseInt(process.env.TWOSLASH_WORKER_COUNT, 10)
	: null;
const NUM_WORKERS =
	workerCountOverride && Number.isFinite(workerCountOverride)
		? Math.max(1, workerCountOverride)
		: Math.min(cpuCap, memCap);

// Per-worker RSS threshold after which a worker is replaced with a fresh
// process. Derived from a global budget that leaves 25% of memory for the OS
// and other processes so combined worker RSS stays bounded on long runs.
const MEM_BUDGET = Math.max(2 * GIB, totalmem() * 0.75);
const recycleLimitOverride = process.env.TWOSLASH_RECYCLE_LIMIT_BYTES
	? parseInt(process.env.TWOSLASH_RECYCLE_LIMIT_BYTES, 10)
	: null;
const RECYCLE_LIMIT_BYTES =
	recycleLimitOverride && Number.isFinite(recycleLimitOverride)
		? recycleLimitOverride
		: Math.round(
				Math.min(2.5 * GIB, Math.max(0.75 * GIB, MEM_BUDGET / NUM_WORKERS)),
			);

// Blocks per work unit handed to a worker at a time. Small enough for
// fine-grained work stealing, large enough to amortize dispatch overhead.
const MAX_UNIT_SIZE = 24;
const MAX_UNIT_SOURCE_LENGTH = 16_000;

// A worker is killed if it makes no progress for this long. Unfinished
// items are requeued on a fresh worker.
const STALL_TIMEOUT_MS = process.env.TWOSLASH_STALL_TIMEOUT_MS
	? parseInt(process.env.TWOSLASH_STALL_TIMEOUT_MS, 10)
	: 3 * 60 * 1000;

// How often an item may be requeued after its worker died before giving up.
const MAX_ATTEMPTS = 2;

// Exit code by which a worker asks to be replaced (memory recycling).
// Keep in sync with twoslash-worker.mjs.
const RECYCLE_EXIT_CODE = 42;

const pluginDir = join(DOCS_ROOT, '..', 'docusaurus-plugin');
const pluginRequire = createRequire(join(pluginDir, 'package.json'));
const twoslashVersion = pluginRequire('twoslash/package.json')
	.version as string;
const shikiVersion = pluginRequire('shiki/package.json').version as string;
const tsVersion = pluginRequire('typescript/package.json').version as string;

interface TwoslashBlock {
	code: string;
	lang: string;
	cachePath: string;
}

interface WorkUnit {
	key: string;
	items: TwoslashBlock[];
}

function computeCachePath(code: string): string {
	const shasum = createHash('sha1');
	const codeSha = shasum
		.update(
			`${code}-${twoslashVersion}-${shikiVersion}-${tsVersion}-github-dark`,
		)
		.digest('hex');
	return join(CACHE_ROOT, `${codeSha}.json`);
}

function addIncludes(
	map: Map<string, string>,
	name: string,
	code: string,
): void {
	const lines: string[] = [];
	code.split('\n').forEach((l) => {
		const trimmed = l.trim();
		if (trimmed.startsWith('// - ')) {
			const key = trimmed.split('// - ')[1].split(' ')[0];
			map.set(name + '-' + key, lines.join('\n'));
		} else {
			lines.push(l);
		}
	});
	map.set(name, lines.join('\n'));
}

function replaceIncludes(map: Map<string, string>, code: string): string {
	const includesRegex = /\/\/ @include: (.*)$/gm;
	const toReplace: [number, number, string][] = [];

	let match;
	while ((match = includesRegex.exec(code)) !== null) {
		if (match.index === includesRegex.lastIndex) {
			includesRegex.lastIndex++;
		}

		const key = match[1];
		const replaceWith = map.get(key);
		if (!replaceWith) {
			return code;
		}

		toReplace.push([match.index, match[0].length, replaceWith]);
	}

	let newCode = code.toString();
	toReplace.reverse().forEach((r) => {
		newCode =
			newCode.substring(0, r[0]) + r[2] + newCode.substring(r[0] + r[1]);
	});
	return newCode;
}

// Remove up to `width` leading spaces from every line, the way CommonMark
// dedents fenced code blocks that are indented (e.g. inside list items).
// This must produce the same string as the `value` of the mdast code node,
// otherwise the cache path computed here will not match the one computed
// during the Docusaurus build.
function dedent(content: string, width: number): string {
	if (width === 0) {
		return content;
	}

	return content
		.split('\n')
		.map((line) => {
			let strip = 0;
			while (strip < width && line[strip] === ' ') {
				strip++;
			}

			return line.slice(strip);
		})
		.join('\n');
}

function extractTwoslashBlocks(
	content: string,
	filePath: string,
	validCachePaths: Set<string>,
	cachePathToFiles: Map<string, string[]>,
): TwoslashBlock[] {
	const blocks: TwoslashBlock[] = [];
	const includes = new Map<string, string>();

	// Also matches blocks indented inside list items — `\1` anchors the
	// closing fence to the same indentation as the opening fence.
	const codeBlockRegex = /^([ \t]*)```(\S*)([^\n]*)\n([\s\S]*?)^\1```[ \t]*$/gm;

	let match;
	while ((match = codeBlockRegex.exec(content)) !== null) {
		const indent = match[1];
		const lang = match[2];
		const meta = match[3].trim();
		const code = dedent(match[4], indent.length).replace(/\n$/, '');

		if (lang === 'twoslash') {
			const includeMatch = meta.match(/include\s+(\S+)/);
			if (includeMatch) {
				addIncludes(includes, includeMatch[1], code);
			}

			continue;
		}

		if (!meta.split(/\s+/).includes('twoslash')) {
			continue;
		}

		const importedCode = replaceIncludes(includes, code);
		const cachePath = computeCachePath(importedCode);
		validCachePaths.add(cachePath);

		// Track which files reference this cache path
		const relPath = filePath.replace(DOCS_ROOT + '/', '');
		if (!cachePathToFiles.has(cachePath)) {
			cachePathToFiles.set(cachePath, []);
		}
		cachePathToFiles.get(cachePath)!.push(relPath);

		if (existsSync(cachePath)) {
			continue;
		}

		blocks.push({code: importedCode, lang, cachePath});
	}

	return blocks;
}

// Snippets that import the same packages reuse the worker's TypeScript
// language service state. Grouping by import set avoids every worker
// having to load the type graph of every package (the dominant cost of a
// cold run, e.g. the AWS SDK types pulled in by @remotion/lambda).
const importRegex = /(?:from\s+|import\s+|require\()['"]([^'"]+)['"]/g;

function importSetKey(code: string): string {
	const packages = new Set<string>();
	for (const match of code.matchAll(importRegex)) {
		const spec = match[1];
		if (spec.startsWith('.') || spec.startsWith('/')) {
			continue;
		}

		const parts = spec.split('/');
		packages.add(spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
	}

	return [...packages].sort().join(',');
}

function buildWorkUnits(blocks: TwoslashBlock[]): WorkUnit[] {
	const groups = new Map<string, TwoslashBlock[]>();
	for (const block of blocks) {
		const key = importSetKey(block.code);
		if (!groups.has(key)) {
			groups.set(key, []);
		}

		groups.get(key)!.push(block);
	}

	const units: WorkUnit[] = [];
	for (const [key, items] of groups) {
		let currentItems: TwoslashBlock[] = [];
		let currentSourceLength = 0;
		for (const item of items) {
			if (
				currentItems.length > 0 &&
				(currentItems.length >= MAX_UNIT_SIZE ||
					currentSourceLength + item.code.length > MAX_UNIT_SOURCE_LENGTH)
			) {
				units.push({key, items: currentItems});
				currentItems = [];
				currentSourceLength = 0;
			}

			currentItems.push(item);
			currentSourceLength += item.code.length;
		}

		if (currentItems.length > 0) {
			units.push({key, items: currentItems});
		}
	}

	// Put more source-heavy units first so expensive outliers do not become
	// stragglers after most workers have exhausted the queue.
	const estimatedCost = (unit: WorkUnit) =>
		unit.items.reduce((total, item) => total + item.code.length, 0);
	units.sort((a, b) => estimatedCost(b) - estimatedCost(a));
	return units;
}

interface TimingEntry {
	cachePath: string;
	ms: number;
	error?: string;
}

interface WorkerHandle {
	id: number;
	child: ChildProcessWithoutNullStreams;
	pendingItems: Map<string, TwoslashBlock>;
	currentKey: string | null;
	lastKey: string | null;
	loadedPackages: Set<string>;
	stallTimer: ReturnType<typeof setTimeout> | null;
	exiting: boolean;
}

async function main() {
	const startTime = performance.now();

	const glob = new Glob('**/*.{mdx,md}');
	const dirs = ['docs', 'blog', 'learn', 'new-docs', 'elements'];

	const allFiles: string[] = [];
	for (const dir of dirs) {
		const fullDir = join(DOCS_ROOT, dir);
		if (!existsSync(fullDir)) continue;
		for await (const file of glob.scan(fullDir)) {
			allFiles.push(join(fullDir, file));
		}
	}

	const allBlocks: TwoslashBlock[] = [];
	const validCachePaths = new Set<string>();
	const cachePathToFiles = new Map<string, string[]>();
	let bundlePromise: Promise<void> | null = null;
	const startWorkerBundle = () => {
		if (bundlePromise !== null) {
			return;
		}

		bundlePromise = (async () => {
			const result = await Bun.build({
				entrypoints: [WORKER_SOURCE_PATH],
				format: 'esm',
				target: 'node',
			});
			if (!result.success || result.outputs.length !== 1) {
				throw new Error(
					`Could not bundle Twoslash worker: ${result.logs.join('\n')}`,
				);
			}

			mkdirSync(dirname(WORKER_PATH), {recursive: true});
			await Bun.write(WORKER_PATH, result.outputs[0]);
		})();
	};

	for (const file of allFiles) {
		const content = expandElementSourceReferences({
			raw: readFileSync(file, 'utf8'),
			sourceFilePath: file,
		});
		const blocks = extractTwoslashBlocks(
			content,
			file,
			validCachePaths,
			cachePathToFiles,
		);
		if (blocks.length > 0) {
			startWorkerBundle();
			allBlocks.push(...blocks);
		}
	}

	// Delete stale cache entries that no longer correspond to any twoslash block
	if (existsSync(CACHE_ROOT)) {
		const cachedFiles = readdirSync(CACHE_ROOT);
		let staleCount = 0;
		for (const file of cachedFiles) {
			const fullPath = join(CACHE_ROOT, file);
			if (!validCachePaths.has(fullPath)) {
				unlinkSync(fullPath);
				staleCount++;
			}
		}

		if (staleCount > 0) {
			console.log(`Deleted ${staleCount} stale cache entries`);
		}
	}

	const uniqueBlocks = new Map<string, TwoslashBlock>();
	for (const block of allBlocks) {
		if (!uniqueBlocks.has(block.cachePath)) {
			uniqueBlocks.set(block.cachePath, block);
		}
	}

	const uncachedBlocks = [...uniqueBlocks.values()];

	if (uncachedBlocks.length === 0) {
		const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
		console.log(`All twoslash blocks are cached (${elapsed}s to scan)`);
		return;
	}

	if (!existsSync(CACHE_ROOT)) {
		mkdirSync(CACHE_ROOT, {recursive: true});
	}

	await bundlePromise;

	const unitQueue = buildWorkUnits(uncachedBlocks);
	const numWorkers = Math.min(NUM_WORKERS, unitQueue.length);

	console.log(
		`${uncachedBlocks.length} twoslash blocks to type-check (${allFiles.length} files scanned)`,
	);
	console.log(
		`Launching ${numWorkers} workers for ${unitQueue.length} work units...`,
	);

	const timings = new Map<string, TimingEntry>();
	const attempts = new Map<string, number>();
	let completedCount = 0;
	let errorCount = 0;
	let respawnBudget = numWorkers * 3;
	const workers = new Set<WorkerHandle>();
	let nextWorkerId = 0;
	let finishing = false;

	let resolveDone: () => void;
	const done = new Promise<void>((r) => {
		resolveDone = r;
	});

	const remainingItems = () =>
		uncachedBlocks.length - completedCount - errorCount;

	const recordResult = (entry: TimingEntry) => {
		timings.set(entry.cachePath, entry);
		if (entry.error) {
			errorCount++;
		} else {
			completedCount++;
		}
	};

	const sendMessage = (
		worker: WorkerHandle,
		message: Record<string, unknown>,
	) => {
		try {
			worker.child.stdin.write(JSON.stringify(message) + '\n');
		} catch {
			// Worker died — its exit handler requeues the work
		}
	};

	const clearStallTimer = (worker: WorkerHandle) => {
		if (worker.stallTimer) {
			clearTimeout(worker.stallTimer);
			worker.stallTimer = null;
		}
	};

	const resetStallTimer = (worker: WorkerHandle) => {
		clearStallTimer(worker);
		worker.stallTimer = setTimeout(() => {
			console.error(
				`Worker ${worker.id} made no progress for ${Math.round(STALL_TIMEOUT_MS / 1000)}s, killing...`,
			);
			worker.child.kill('SIGKILL');
		}, STALL_TIMEOUT_MS);
	};

	// Pick the queued unit whose type graphs the worker has already loaded
	// where possible — loading a new package graph costs far more than the
	// type-checking itself, and accumulating graphs grows the worker's RSS.
	const takeUnit = (worker: WorkerHandle): WorkUnit | null => {
		if (unitQueue.length === 0) {
			return null;
		}

		let bestIndex = 0;
		if (worker.loadedPackages.size > 0) {
			let bestScore = -Infinity;
			for (let i = 0; i < unitQueue.length; i++) {
				const unit = unitQueue[i];
				if (unit.key === worker.lastKey) {
					bestIndex = i;
					break;
				}

				const packages = unit.key === '' ? [] : unit.key.split(',');
				let overlap = 0;
				for (const pkg of packages) {
					if (worker.loadedPackages.has(pkg)) {
						overlap++;
					}
				}

				const score = overlap * 2 - (packages.length - overlap);
				if (score > bestScore) {
					bestScore = score;
					bestIndex = i;
				}
			}
		}

		return unitQueue.splice(bestIndex, 1)[0];
	};

	const maybeFinish = () => {
		if (finishing) {
			return;
		}

		if (remainingItems() > 0) {
			return;
		}

		finishing = true;
		for (const worker of workers) {
			worker.exiting = true;
			clearStallTimer(worker);
			sendMessage(worker, {type: 'exit'});
		}

		// Give workers a moment to exit cleanly, then force-kill stragglers
		setTimeout(() => {
			for (const worker of workers) {
				worker.child.kill('SIGKILL');
			}

			resolveDone();
		}, 5000).unref?.();

		const checkAllClosed = setInterval(() => {
			if (workers.size === 0) {
				clearInterval(checkAllClosed);
				resolveDone();
			}
		}, 100);
	};

	const assignNextUnit = (worker: WorkerHandle) => {
		const unit = takeUnit(worker);
		if (!unit) {
			worker.exiting = true;
			clearStallTimer(worker);
			sendMessage(worker, {type: 'exit'});
			maybeFinish();
			return;
		}

		worker.currentKey = unit.key;
		worker.lastKey = unit.key;
		for (const pkg of unit.key.split(',')) {
			if (pkg) {
				worker.loadedPackages.add(pkg);
			}
		}

		worker.pendingItems = new Map(
			unit.items.map((item) => [item.cachePath, item]),
		);
		resetStallTimer(worker);
		sendMessage(worker, {type: 'unit', items: unit.items});
	};

	const handleWorkerExit = (worker: WorkerHandle, code: number | null) => {
		clearStallTimer(worker);
		workers.delete(worker);

		const died = !worker.exiting && code !== RECYCLE_EXIT_CODE;
		const unfinished = [...worker.pendingItems.values()];
		worker.pendingItems = new Map();

		if (unfinished.length > 0) {
			const requeue: TwoslashBlock[] = [];
			for (const item of unfinished) {
				// A worker can be killed while writing. Only its batched completion
				// message proves the final cache file is complete.
				if (existsSync(item.cachePath)) {
					unlinkSync(item.cachePath);
				}

				const attempt = (attempts.get(item.cachePath) ?? 0) + 1;
				attempts.set(item.cachePath, attempt);
				if (attempt >= MAX_ATTEMPTS) {
					recordResult({
						cachePath: item.cachePath,
						ms: 0,
						error: `Worker died ${attempt} times while processing this snippet`,
					});
				} else {
					requeue.push(item);
				}
			}

			if (requeue.length > 0) {
				unitQueue.unshift({key: worker.currentKey ?? '', items: requeue});
			}
		}

		if (died) {
			respawnBudget--;
			console.error(
				`Worker ${worker.id} died unexpectedly (exit code ${code ?? 'signal'}), requeueing its work`,
			);

			if (respawnBudget <= 0) {
				console.error('Too many worker crashes, giving up on remaining work');
				for (const unit of unitQueue.splice(0)) {
					for (const item of unit.items) {
						recordResult({
							cachePath: item.cachePath,
							ms: 0,
							error: 'Skipped after too many worker crashes',
						});
					}
				}

				maybeFinish();
				return;
			}
		}

		if (finishing) {
			maybeFinish();
			return;
		}

		const workScheduled =
			unitQueue.length > 0 || [...workers].some((w) => w.pendingItems.size > 0);

		if (unitQueue.length > 0 && workers.size < numWorkers) {
			spawnWorker();
		} else if (!workScheduled) {
			maybeFinish();
		}
	};

	const spawnWorker = () => {
		const worker: WorkerHandle = {
			id: nextWorkerId++,
			child: spawn('node', ['--no-warnings', WORKER_PATH], {
				cwd: DOCS_ROOT,
				stdio: ['pipe', 'pipe', 'pipe'],
				env: {
					...process.env,
					TWOSLASH_RECYCLE_LIMIT_BYTES: String(RECYCLE_LIMIT_BYTES),
				},
			}),
			pendingItems: new Map(),
			currentKey: null,
			lastKey: null,
			loadedPackages: new Set(),
			stallTimer: null,
			exiting: false,
		};
		workers.add(worker);
		resetStallTimer(worker);

		// Don't crash on EPIPE if the worker dies while we write to it
		worker.child.stdin.on('error', () => undefined);

		const rl = createInterface({input: worker.child.stdout});
		rl.on('line', (line: string) => {
			let message: {
				type: string;
				results?: TimingEntry[];
				recycling?: boolean;
				rss?: number;
			};
			try {
				message = JSON.parse(line);
			} catch {
				return;
			}

			if (message.type === 'ready') {
				assignNextUnit(worker);
				return;
			}

			if (message.type === 'unit-done') {
				for (const result of message.results ?? []) {
					worker.pendingItems.delete(result.cachePath);
					recordResult(result);
				}

				worker.currentKey = null;
				if (message.recycling) {
					// The worker exits after this message; its exit handler
					// spawns a replacement that picks up the remaining units.
					console.log(
						`  Worker ${worker.id} recycled at ${Math.round((message.rss ?? 0) / 1024 / 1024)} MB RSS`,
					);
					worker.exiting = true;
					clearStallTimer(worker);
					return;
				}

				assignNextUnit(worker);
			}
		});

		worker.child.stderr.on('data', (data: Buffer) => {
			process.stderr.write(`[worker ${worker.id}] ${data}`);
		});

		worker.child.on('close', (code) => {
			handleWorkerExit(worker, code);
		});

		worker.child.on('error', () => {
			handleWorkerExit(worker, 1);
		});
	};

	for (let i = 0; i < numWorkers; i++) {
		spawnWorker();
	}

	const progressInterval = setInterval(() => {
		const elapsed = ((performance.now() - startTime) / 1000).toFixed(0);
		console.log(
			`  ${elapsed}s elapsed, ${completedCount}/${uncachedBlocks.length} done, ${unitQueue.length} units queued, ${workers.size} workers`,
		);
	}, 15000);

	await done;
	clearInterval(progressInterval);

	const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);

	const allTimings = [...timings.values()]
		.map((t) => ({
			...t,
			sourceFiles: cachePathToFiles.get(t.cachePath) ?? [],
		}))
		.sort((a, b) => b.ms - a.ms);

	console.log(
		`\nTwoslash pre-warm: ${completedCount} blocks in ${totalTime}s using ${numWorkers} workers (${errorCount} errors)`,
	);

	const errorTimings = allTimings.filter((t) => t.error);
	if (errorTimings.length > 0) {
		console.log(`\nErrors:`);
		for (const t of errorTimings) {
			const files = t.sourceFiles.join(', ');
			console.log(`  ${t.ms}ms - ${files} ERROR: ${t.error}`);
		}
	}

	console.log(`\nSlowest snippets:`);
	for (const t of allTimings.slice(0, 30)) {
		const files = t.sourceFiles.join(', ');
		const status = t.error ? ` ERROR: ${t.error}` : '';
		console.log(`  ${t.ms}ms - ${files}${status}`);
	}

	if (errorCount > 0) {
		console.error(`\n${errorCount} twoslash errors — failing build`);
		process.exit(1);
	}

	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
