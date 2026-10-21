import {execFileSync} from 'child_process';
import {existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import {createInterface} from 'readline';
import {
	rendererClassic,
	transformerTwoslash,
} from '@remotion/typescript-tools/shiki-twoslash';
import {createTwoslasher} from '@remotion/typescript-tools/twoslash';
import {createHighlighter} from 'shiki';
import {createNativeTwoslasher} from '../docusaurus-plugin/src/native-twoslash.ts';
import {
	getTwoslashCompilerOptions,
	getTwoslashEngine,
	TWOSLASH_EXPLICIT_TRIGGER,
	TWOSLASH_LANGUAGES,
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

// Reuse one compiler service for all snippets handled by this worker.
const nativeTwoslasher =
	getTwoslashEngine() === 'native'
		? await createNativeTwoslasher({
				rootDirectory: process.cwd(),
				compilerOptions: getTwoslashCompilerOptions(),
			})
		: null;
const legacyTwoslasher =
	nativeTwoslasher === null
		? createTwoslasher({compilerOptions: getTwoslashCompilerOptions()})
		: null;

const send = (message) => {
	process.stdout.write(JSON.stringify(message) + '\n');
};

const highlighter = await createHighlighter({
	themes: [TWOSLASH_THEME],
	langs: LANGS,
});

const processItem = async (item) => {
	const start = performance.now();
	try {
		const nativeResult =
			nativeTwoslasher && TWOSLASH_LANGUAGES.includes(item.lang)
				? await nativeTwoslasher(item.code, item.lang)
				: null;
		const twoslasher = nativeResult ? () => nativeResult : legacyTwoslasher;
		const transformer = twoslasher
			? transformerTwoslash({
					twoslasher,
					langs: TWOSLASH_LANGUAGES,
					renderer: rendererClassic(),
					explicitTrigger: TWOSLASH_EXPLICIT_TRIGGER,
				})
			: null;
		const html = highlighter.codeToHtml(item.code, {
			lang: item.lang,
			theme: TWOSLASH_THEME,
			transformers: transformer ? [transformer] : [],
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

let exitCode = 0;
try {
	for await (const line of rl) {
		let message;
		try {
			message = JSON.parse(line);
		} catch {
			continue;
		}

		if (message.type === 'exit') {
			break;
		}

		if (message.type === 'unit') {
			const results = [];
			for (const item of message.items) {
				results.push(await processItem(item));
			}
			let rss = process.memoryUsage.rss();
			if (nativeTwoslasher?.nativeProcessId) {
				// Apply the same memory budget to both engines, including the
				// native language server running outside this Node process.
				const pid = String(nativeTwoslasher.nativeProcessId);
				const nativeRss =
					process.platform === 'win32'
						? Number(
								execFileSync(
									'powershell.exe',
									[
										'-NoProfile',
										'-Command',
										`(Get-Process -Id ${pid}).WorkingSet64`,
									],
									{encoding: 'utf8'},
								),
							)
						: Number(
								execFileSync('ps', ['-o', 'rss=', '-p', pid], {
									encoding: 'utf8',
								}),
							) * 1024;
				if (!Number.isFinite(nativeRss) || nativeRss <= 0) {
					throw new Error('Could not measure native TypeScript memory usage');
				}
				rss += nativeRss;
			}
			const recycling = rss > MEMORY_RECYCLE_LIMIT_BYTES;
			send({type: 'unit-done', results, rss, recycling});

			if (recycling) {
				exitCode = RECYCLE_EXIT_CODE;
				break;
			}
		}
	}
} finally {
	await nativeTwoslasher?.dispose();
	rl.close();
}

process.exit(exitCode);
