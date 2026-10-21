/* eslint-disable no-console */
import {createRequire} from 'module';
import {resolve} from 'path';
import type {TwoslashShikiFunction} from '@remotion/typescript-tools/shiki-twoslash';
import {
	rendererClassic,
	transformerTwoslash,
} from '@remotion/typescript-tools/shiki-twoslash';
import {createTwoslasher} from '@remotion/typescript-tools/twoslash';
import type {HighlighterGeneric} from 'shiki/core';
import {
	createTwoslashCacheContext,
	getTwoslashCacheKey,
	getTwoslashCompilerOptions,
	getTwoslashEngine,
	getTwoslashVersions,
	readTwoslashCacheEntry,
	TWOSLASH_EXPLICIT_TRIGGER,
	TWOSLASH_LANGUAGES,
	TWOSLASH_THEME,
	writeTwoslashCacheEntry,
} from './twoslash-cache';

let cachedTwoslasher: ReturnType<typeof createTwoslasher> | null = null;
let cacheContext: ReturnType<typeof createTwoslashCacheContext> | null = null;

function getTwoslasher() {
	if (!cachedTwoslasher) {
		cachedTwoslasher = createTwoslasher({
			compilerOptions: getTwoslashCompilerOptions(),
		});
	}

	return cachedTwoslasher;
}

const getCacheContext = () => {
	if (!cacheContext) {
		const packageRequire = createRequire(__filename);
		cacheContext = createTwoslashCacheContext({
			docsRoot: resolve(process.cwd()),
			versions: getTwoslashVersions(packageRequire.resolve),
		});
	}

	return cacheContext;
};

/**
 * Keeps a local cache of the final HTML in node_modules/.cache/twoslash.
 */
export const cachedTwoslashCall = async (
	code: string,
	lang: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	highlighter: HighlighterGeneric<any, any>,
): Promise<string> => {
	const context = getCacheContext();
	const key = getTwoslashCacheKey({code, lang, context});
	const cached = readTwoslashCacheEntry({context, key});
	if (cached !== null) {
		if (process.env.debug) {
			console.log(`Using cached Twoslash result ${key}`);
		}

		return cached;
	}

	let twoslasher: TwoslashShikiFunction | null = null;
	if (getTwoslashEngine() === 'native' && TWOSLASH_LANGUAGES.includes(lang)) {
		const {createNativeTwoslasher} = await import('./native-twoslash');
		const nativeTwoslasher = await createNativeTwoslasher({
			rootDirectory: resolve(process.cwd()),
			compilerOptions: getTwoslashCompilerOptions(),
		});
		try {
			const result = await nativeTwoslasher(code, lang);
			twoslasher = () => result;
		} finally {
			await nativeTwoslasher.dispose();
		}
	} else if (getTwoslashEngine() === 'legacy') {
		twoslasher = getTwoslasher();
	}

	const html = highlighter.codeToHtml(code, {
		lang,
		theme: TWOSLASH_THEME,
		transformers: twoslasher
			? [
					transformerTwoslash({
						twoslasher,
						langs: TWOSLASH_LANGUAGES,
						renderer: rendererClassic(),
						explicitTrigger: TWOSLASH_EXPLICIT_TRIGGER,
					}),
				]
			: [],
	});

	writeTwoslashCacheEntry({context, key, html});
	return html;
};
