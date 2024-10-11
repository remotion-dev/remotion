import type {TwoSlashReturn} from '@typescript/twoslash';
import type {UserConfigSettings} from 'shiki-twoslash';
import {runTwoSlash} from 'shiki-twoslash';

/**
 * Keeps a cache of the JSON responses to a twoslash call in node_modules/.cache/twoslash
 * which should keep CI times down (e.g. the epub vs the handbook etc) - but also during
 * dev time, where it can be super useful.
 */
export const cachedTwoslashCall = (
	code: string,
	lang: string,
	settings: UserConfigSettings,
): TwoSlashReturn => {
	const isWebWorker =
		typeof self !== 'undefined' &&
		// @ts-expect-error
		typeof self.WorkerGlobalScope !== 'undefined';
	const isBrowser =
		isWebWorker ||
		(typeof window !== 'undefined' &&
			typeof window.document !== 'undefined' &&
			typeof fetch !== 'undefined');

	if (isBrowser) {
		// Not in Node, run un-cached
		return runTwoSlash(code, lang, settings);
	}

	const {createHash} = require('crypto');
	const {readFileSync, existsSync, mkdirSync, writeFileSync} = require('fs');
	const {join} = require('path');

	const shikiVersion = require('@typescript/twoslash/package.json').version;
	const tsVersion = require('typescript/package.json').version;

	const shasum = createHash('sha1');
	const codeSha = shasum
		.update(`${code}-${shikiVersion}-${tsVersion}`)
		.digest('hex');

	const getNmCache = () => {
		const p = join(process.cwd(), 'node_modules', '.cache', 'twoslash');
		console.log(p);
		return p;
	};

	const cacheRoot = getNmCache();

	const cachePath = join(cacheRoot, `${codeSha}.json`);

	if (existsSync(cachePath)) {
		if (process.env.debug)
			console.log(`Using cached twoslash results from ${cachePath}`);

		return JSON.parse(readFileSync(cachePath, 'utf8'));
	}

	const results = runTwoSlash(code, lang, settings);
	if (!existsSync(cacheRoot)) mkdirSync(cacheRoot, {recursive: true});
	writeFileSync(cachePath, JSON.stringify(results), 'utf8');
	return results;
};
