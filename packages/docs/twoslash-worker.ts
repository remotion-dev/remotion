import {rendererClassic, transformerTwoslash} from '@shikijs/twoslash';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import {createInterface} from 'readline';
import {createHighlighter} from 'shiki';
import {createTwoslasher} from 'twoslash';

interface WorkItem {
	code: string;
	lang: string;
	cachePath: string;
}

type InboundMessage = {type: 'unit'; items: WorkItem[]} | {type: 'exit'};

// Exit code by which this worker asks to be replaced (memory recycling).
// Keep in sync with prewarm-twoslash.ts.
const RECYCLE_EXIT_CODE = 42;

// The TypeScript language service grows as snippets with new imports are
// type-checked. Recycle the process once it gets too large. The dispatcher
// derives the limit from the machine's total memory.
const MEMORY_RECYCLE_LIMIT_BYTES =
	Number(process.env.TWOSLASH_RECYCLE_LIMIT_BYTES) || 1.5 * 1024 * 1024 * 1024;

const LANGS = ['tsx', 'ts', 'typescript', 'jsx', 'javascript', 'json'];

// Create Language Service ONCE per worker — reused across all units
const twoslasher = createTwoslasher({
	compilerOptions: {
		types: ['node'],
		target: 99 /* ESNext */,
		module: 99 /* ESNext */,
		jsx: 4 /* ReactJSX */,
	},
});

const transformer = transformerTwoslash({
	twoslasher,
	renderer: rendererClassic(),
	explicitTrigger: false,
});

const send = (message: Record<string, unknown>) => {
	process.stdout.write(JSON.stringify(message) + '\n');
};

const highlighter = await createHighlighter({
	themes: ['github-dark'],
	langs: LANGS,
});

const processItem = (item: WorkItem) => {
	const start = performance.now();
	try {
		const html = highlighter.codeToHtml(item.code, {
			lang: item.lang,
			theme: 'github-dark',
			transformers: [transformer],
		});

		const dir = dirname(item.cachePath);
		if (!existsSync(dir)) mkdirSync(dir, {recursive: true});
		writeFileSync(item.cachePath, html, 'utf8');
		send({
			type: 'item',
			cachePath: item.cachePath,
			ms: Math.round(performance.now() - start),
		});
	} catch (error) {
		send({
			type: 'item',
			cachePath: item.cachePath,
			ms: Math.round(performance.now() - start),
			error: (error as Error).message.slice(0, 300),
		});
	}
};

send({type: 'ready'});

const rl = createInterface({input: process.stdin});

rl.on('line', (line: string) => {
	let message: InboundMessage;
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
		for (const item of message.items) {
			processItem(item);
		}

		const rss = process.memoryUsage.rss();
		const recycling = rss > MEMORY_RECYCLE_LIMIT_BYTES;
		send({type: 'unit-done', rss, recycling});

		if (recycling) {
			// Ask the dispatcher to replace this worker with a fresh one
			process.exit(RECYCLE_EXIT_CODE);
		}
	}
});

rl.on('close', () => {
	process.exit(0);
});
