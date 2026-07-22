/* eslint-disable no-console */
import {createRequire} from 'module';
import {resolve} from 'path';
import {rendererClassic, transformerTwoslash} from '@shikijs/twoslash';
import type {HighlighterGeneric} from 'shiki/core';
import {createTwoslasher} from 'twoslash';
import {
	createTwoslashCacheContext,
	getTwoslashCacheKey,
	getTwoslashCompilerOptions,
	getTwoslashVersions,
	readTwoslashCacheEntry,
	TWOSLASH_EXPLICIT_TRIGGER,
	TWOSLASH_THEME,
	writeTwoslashCacheEntry,
} from './twoslash-cache';

let cachedTwoslasher: ReturnType<typeof createTwoslasher> | null = null;
let cacheContext: ReturnType<typeof createTwoslashCacheContext> | null = null;

const TWOSLASH_LANGUAGES = [
	'ts',
	'tsx',
	'typescript',
	'js',
	'jsx',
	'javascript',
];

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
 * Keeps a local cache of the final HTML and shares immutable entries with the
 * other worktrees belonging to the same Git repository.
 */
export const cachedTwoslashCall = (
	code: string,
	lang: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	highlighter: HighlighterGeneric<any, any>,
): string => {
	const context = getCacheContext();
	const key = getTwoslashCacheKey({code, lang, context});
	const cached = readTwoslashCacheEntry({context, key});
	if (cached !== null) {
		if (process.env.debug) {
			console.log(`Using cached Twoslash result ${key}`);
		}

		return cached;
	}

	const twoslasher = getTwoslasher();
	const html = highlighter.codeToHtml(code, {
		lang,
		theme: TWOSLASH_THEME,
		transformers: [
			transformerTwoslash({
				twoslasher,
				renderer: rendererClassic(),
				explicitTrigger: TWOSLASH_EXPLICIT_TRIGGER,
				langs: TWOSLASH_LANGUAGES,
			}),
		],
	});

	writeTwoslashCacheEntry({context, key, html});
	return html;
};
