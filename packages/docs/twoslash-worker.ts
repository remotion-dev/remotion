import {rendererClassic, transformerTwoslash} from '@shikijs/twoslash';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import {createHighlighter} from 'shiki';
import {createTwoslasher} from 'twoslash';

interface WorkItem {
	code: string;
	lang: string;
	cachePath: string;
}

// Read work items from the file passed as argument
const workFile = process.argv[2];
const items: WorkItem[] = JSON.parse(readFileSync(workFile, 'utf8'));

// Create Language Service ONCE per worker (5-20x faster for batch)
const twoslasher = createTwoslasher({
	compilerOptions: {
		types: ['node'],
		target: 99 /* ESNext */,
		module: 99 /* ESNext */,
		jsx: 4 /* ReactJSX */,
	},
});

// Collect unique languages from work items
const uniqueLangs = [...new Set(items.map((item) => item.lang))];

// Create highlighter ONCE with all needed languages
const highlighter = await createHighlighter({
	themes: ['github-dark'],
	langs: uniqueLangs,
});

const transformer = transformerTwoslash({
	twoslasher,
	renderer: rendererClassic(),
	explicitTrigger: false,
});

let completed = 0;
let errors = 0;
const timings: Array<{cachePath: string; ms: number; error?: string}> = [];

for (const item of items) {
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
		completed++;
		timings.push({
			cachePath: item.cachePath,
			ms: Math.round(performance.now() - start),
		});
	} catch (error) {
		errors++;
		timings.push({
			cachePath: item.cachePath,
			ms: Math.round(performance.now() - start),
			error: (error as Error).message.slice(0, 200),
		});
	}

	// Report progress every 10 items
	if ((completed + errors) % 10 === 0) {
		process.stdout.write(
			JSON.stringify({completed, errors, total: items.length, timings}) +
				'\n',
		);
	}
}

// Final report
process.stdout.write(
	JSON.stringify({
		completed,
		errors,
		total: items.length,
		done: true,
		timings,
	}) + '\n',
);

// Force exit — createTwoslasher holds a TS language service that keeps the process alive
process.exit(0);
