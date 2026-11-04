import {execFileSync} from 'child_process';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from 'fs';
import {dirname} from 'path';
import {createInterface} from 'readline';
import {
	rendererClassic,
	createTransformerFactory,
} from '@shikijs/twoslash/core';
import {createHighlighter} from 'shiki';
import {createDocsTwoslasher} from '../docusaurus-plugin/src/docs-twoslasher.ts';
import {
	TWOSLASH_EXPLICIT_TRIGGER,
	TWOSLASH_THEME,
} from '../docusaurus-plugin/src/twoslash-cache.ts';

// Exit code by which a worker asks to be replaced (memory recycling).
// Keep in sync with prewarm-twoslash.ts.
const RECYCLE_EXIT_CODE = 42;

// The TypeScript language service grows as snippets with new imports are
// type-checked. Recycle the process once it gets too large. The dispatcher
// derives the limit from the machine's total memory.
const MEMORY_RECYCLE_LIMIT_BYTES =
	Number(process.env.TWOSLASH_RECYCLE_LIMIT_BYTES) || 1.5 * 1024 * 1024 * 1024;

const LANGS = ['tsx', 'ts', 'jsx', 'javascript'];

// Reuse the compiler across work units, and close the native child on exit.
const compiler = createDocsTwoslasher({
	rootDirectory: process.cwd(),
});
process.once('exit', compiler.dispose);
process.once('SIGTERM', () => process.exit(143));
process.once('SIGINT', () => process.exit(130));

const transformer = createTransformerFactory(
	compiler.twoslasher,
	rendererClassic(),
)({
	explicitTrigger: TWOSLASH_EXPLICIT_TRIGGER,
});

const send = (message) => {
	process.stdout.write(JSON.stringify(message) + '\n');
};

const highlighter = await createHighlighter({
	themes: [TWOSLASH_THEME],
	langs: LANGS,
});

const processItem = (item) => {
	const start = performance.now();
	try {
		const html = highlighter.codeToHtml(item.code, {
			lang: item.lang,
			theme: TWOSLASH_THEME,
			transformers: [transformer],
		});

		const dir = dirname(item.cachePath);
		if (!existsSync(dir)) mkdirSync(dir, {recursive: true});
		const temporaryCachePath = `${item.cachePath}.${process.pid}.tmp`;
		try {
			writeFileSync(temporaryCachePath, html, 'utf8');
			renameSync(temporaryCachePath, item.cachePath);
		} finally {
			if (existsSync(temporaryCachePath)) {
				unlinkSync(temporaryCachePath);
			}
		}

		return {
			cachePath: item.cachePath,
			ms: Math.round(performance.now() - start),
		};
	} catch (error) {
		return {
			cachePath: item.cachePath,
			ms: Math.round(performance.now() - start),
			error:
				error instanceof Error ? error.message.slice(0, 300) : String(error),
		};
	}
};

send({type: 'ready'});

const rl = createInterface({input: process.stdin});

rl.on('line', (line) => {
	let message;
	try {
		message = JSON.parse(line);
	} catch {
		return;
	}

	if (message.type === 'exit') {
		// The TS language service keeps the process alive — exit explicitly
		process.exit(0);
	}

	if (message.type === 'unit') {
		const results = message.items.map(processItem);
		let rss = process.memoryUsage.rss();
		// The TypeScript API runs its compiler in a separate process. Include it
		// in the worker recycling budget along with the Node.js process.
		if (process.platform === 'linux') {
			const children = readFileSync(
				`/proc/${process.pid}/task/${process.pid}/children`,
				'utf8',
			).trim();
			for (const pid of children.split(/\s+/).filter(Boolean)) {
				try {
					const status = readFileSync(`/proc/${pid}/status`, 'utf8');
					const childRss = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status);
					rss += Number(childRss?.[1] ?? 0) * 1024;
				} catch (error) {
					if (error.code !== 'ENOENT') throw error;
				}
			}
		} else if (process.platform === 'win32') {
			rss += Number(
				execFileSync(
					'powershell.exe',
					[
						'-NoProfile',
						'-NonInteractive',
						'-Command',
						`(Get-CimInstance Win32_Process -Filter "ParentProcessId = ${process.pid}" | ForEach-Object { (Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue).WorkingSet64 } | Measure-Object -Sum).Sum`,
					],
					{encoding: 'utf8'},
				).trim(),
			);
		} else {
			for (const line of execFileSync('ps', ['-axo', 'ppid=,rss='], {
				encoding: 'utf8',
			}).split('\n')) {
				const [parent, childRss] = line.trim().split(/\s+/).map(Number);
				if (parent === process.pid) rss += childRss * 1024;
			}
		}
		const recycling = rss > MEMORY_RECYCLE_LIMIT_BYTES;
		send({type: 'unit-done', results, rss, recycling});

		if (recycling) {
			// Ask the dispatcher to replace this worker with a fresh one
			process.exit(RECYCLE_EXIT_CODE);
		}
	}
});

rl.on('close', () => {
	process.exit(0);
});
