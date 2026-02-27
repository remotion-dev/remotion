import {spawn} from 'child_process';
import {createHash} from 'crypto';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from 'fs';
import {createRequire} from 'module';
import {availableParallelism, cpus} from 'os';
import {join, resolve} from 'path';
import {Glob} from 'bun';

const DOCS_ROOT = resolve(import.meta.dirname);
const CACHE_ROOT = join(DOCS_ROOT, 'node_modules', '.cache', 'twoslash');
const WORKER_PATH = join(DOCS_ROOT, 'twoslash-worker.ts');
const cpuCount =
	typeof availableParallelism === 'function'
		? availableParallelism()
		: cpus().length;
const NUM_WORKERS = process.env.VERCEL
	? Math.max(1, cpuCount - 1)
	: Math.max(1, cpuCount - 2);

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
	sourceFiles: string[];
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

function extractTwoslashBlocks(
	content: string,
	filePath: string,
	validCachePaths: Set<string>,
	cachePathToFiles: Map<string, string[]>,
): TwoslashBlock[] {
	const blocks: TwoslashBlock[] = [];
	const includes = new Map<string, string>();

	const codeBlockRegex = /^```(\S*)(.*?)\n([\s\S]*?)^```$/gm;

	let match;
	while ((match = codeBlockRegex.exec(content)) !== null) {
		const lang = match[1];
		const meta = match[2].trim();
		const code = match[3].replace(/\n$/, '');

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

		blocks.push({code: importedCode, lang, cachePath, sourceFiles: []});
	}

	return blocks;
}

interface TimingEntry {
	cachePath: string;
	ms: number;
	error?: string;
}

interface WorkerResult {
	completed: number;
	errors: number;
	timings: TimingEntry[];
}

const WORKER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes per worker

function runWorker(
	workItems: TwoslashBlock[],
	workerId: number,
): Promise<WorkerResult> {
	return new Promise((resolvePromise, reject) => {
		const tmpFile = join(DOCS_ROOT, `.twoslash-work-${workerId}.json`);
		writeFileSync(tmpFile, JSON.stringify(workItems));

		const child = spawn('bun', ['run', WORKER_PATH, tmpFile], {
			cwd: DOCS_ROOT,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		let lastReport: WorkerResult = {completed: 0, errors: 0, timings: []};
		let settled = false;

		const timeout = setTimeout(() => {
			if (!settled) {
				settled = true;
				console.error(
					`Worker ${workerId} timed out after ${WORKER_TIMEOUT_MS / 1000}s, killing...`,
				);
				child.kill('SIGKILL');
				try {
					unlinkSync(tmpFile);
				} catch {}
				resolvePromise(lastReport);
			}
		}, WORKER_TIMEOUT_MS);

		child.stdout.on('data', (data: Buffer) => {
			const lines = data.toString().trim().split('\n');
			for (const line of lines) {
				try {
					lastReport = JSON.parse(line);
				} catch {
					// ignore non-JSON output
				}
			}
		});

		child.stderr.on('data', (data: Buffer) => {
			process.stderr.write(`[worker ${workerId}] ${data}`);
		});

		child.on('close', (code) => {
			clearTimeout(timeout);
			if (!settled) {
				settled = true;
				if (code !== 0 && code !== null) {
					console.error(`Worker ${workerId} exited with code ${code}`);
				}
				try {
					unlinkSync(tmpFile);
				} catch {}
				resolvePromise(lastReport);
			}
		});

		child.on('error', (err) => {
			clearTimeout(timeout);
			if (!settled) {
				settled = true;
				try {
					unlinkSync(tmpFile);
				} catch {}
				reject(err);
			}
		});
	});
}

async function main() {
	const startTime = performance.now();

	const glob = new Glob('**/*.{mdx,md}');
	const dirs = ['docs', 'blog', 'learn', 'new-docs'];

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
	for (const file of allFiles) {
		const content = readFileSync(file, 'utf8');
		allBlocks.push(
			...extractTwoslashBlocks(
				content,
				file,
				validCachePaths,
				cachePathToFiles,
			),
		);
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
			block.sourceFiles = cachePathToFiles.get(block.cachePath) || [];
			uniqueBlocks.set(block.cachePath, block);
		}
	}

	const uncachedBlocks = [...uniqueBlocks.values()];

	if (uncachedBlocks.length === 0) {
		const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
		console.log(`All twoslash blocks are cached (${elapsed}s to scan)`);
		return;
	}

	console.log(
		`${uncachedBlocks.length} twoslash blocks to type-check (${allFiles.length} files scanned)`,
	);

	if (!existsSync(CACHE_ROOT)) {
		mkdirSync(CACHE_ROOT, {recursive: true});
	}

	const numWorkers = Math.min(NUM_WORKERS, uncachedBlocks.length);
	console.log(`Launching ${numWorkers} workers...`);

	const chunks: TwoslashBlock[][] = Array.from({length: numWorkers}, () => []);
	uncachedBlocks.forEach((block, i) => {
		chunks[i % numWorkers].push(block);
	});

	const workerPromises = chunks.map((chunk, i) => runWorker(chunk, i));

	const progressInterval = setInterval(() => {
		const cached = existsSync(CACHE_ROOT) ? readdirSync(CACHE_ROOT).length : 0;
		const elapsed = ((performance.now() - startTime) / 1000).toFixed(0);
		console.log(`  ${elapsed}s elapsed, ~${cached} cached`);
	}, 15000);

	const results = await Promise.all(workerPromises);
	clearInterval(progressInterval);
	console.log('Workers completed');

	const totalCompleted = results.reduce((s, r) => s + r.completed, 0);
	const totalErrors = results.reduce((s, r) => s + r.errors, 0);
	const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);

	// Collect all timings and sort by duration (slowest first)
	const allTimings: (TimingEntry & {sourceFiles: string[]})[] = [];
	for (const result of results) {
		for (const t of result.timings) {
			const files = cachePathToFiles.get(t.cachePath) || [];
			allTimings.push({...t, sourceFiles: files});
		}
	}

	allTimings.sort((a, b) => b.ms - a.ms);

	console.log(
		`\nTwoslash pre-warm: ${totalCompleted} blocks in ${totalTime}s using ${numWorkers} workers (${totalErrors} errors)`,
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

	if (totalErrors > 0) {
		console.error(`\n${totalErrors} twoslash errors — failing build`);
		process.exit(1);
	}

	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
