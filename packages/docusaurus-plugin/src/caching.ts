/* eslint-disable no-console */
import {rendererClassic, transformerTwoslash} from '@shikijs/twoslash';
import type {HighlighterGeneric} from 'shiki/core';
import {createTwoslasher} from 'twoslash';

let cachedTwoslasher: ReturnType<typeof createTwoslasher> | null = null;

function getTwoslasher() {
	if (!cachedTwoslasher) {
		cachedTwoslasher = createTwoslasher({
			compilerOptions: {
				types: ['node'],
				target: 99 /* ESNext */,
				module: 99 /* ESNext */,
				jsx: 4 /* ReactJSX */,
			},
		});
	}

	return cachedTwoslasher;
}

/**
 * Keeps a cache of the HTML responses in node_modules/.cache/twoslash
 * which should keep CI times down — but also during dev time.
 * Returns an HTML string (final rendered output).
 */
export const cachedTwoslashCall = (
	code: string,
	lang: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	highlighter: HighlighterGeneric<any, any>,
): string => {
	const {createHash} = require('crypto');
	const {readFileSync, existsSync, mkdirSync, writeFileSync} = require('fs');
	const {join} = require('path');

	const {createRequire} = require('module');
	const _require = createRequire(__filename);
	const readPkgVersion = (pkg: string) => {
		const entryPath = _require.resolve(pkg);
		let dir = require('path').dirname(entryPath);
		while (dir !== '/') {
			const p = join(dir, 'package.json');
			if (existsSync(p)) {
				return JSON.parse(readFileSync(p, 'utf8')).version as string;
			}

			dir = require('path').dirname(dir);
		}

		return 'unknown';
	};

	const twoslashVersion = readPkgVersion('twoslash');
	const shikiVersion = readPkgVersion('shiki');
	const tsVersion = readPkgVersion('typescript');

	const shasum = createHash('sha1');
	const codeSha = shasum
		.update(
			`${code}-${twoslashVersion}-${shikiVersion}-${tsVersion}-github-dark`,
		)
		.digest('hex');

	const getNmCache = () => {
		const p = join(process.cwd(), 'node_modules', '.cache', 'twoslash');
		return p;
	};

	const cacheRoot = getNmCache();
	const cachePath = join(cacheRoot, `${codeSha}.json`);

	if (existsSync(cachePath)) {
		if (process.env.debug)
			console.log(`Using cached twoslash results from ${cachePath}`);

		return readFileSync(cachePath, 'utf8');
	}

	const twoslasher = getTwoslasher();

	const html = highlighter.codeToHtml(code, {
		lang,
		theme: 'github-dark',
		transformers: [
			transformerTwoslash({
				twoslasher,
				renderer: rendererClassic(),
				explicitTrigger: false,
			}),
		],
	});

	if (!existsSync(cacheRoot)) mkdirSync(cacheRoot, {recursive: true});
	writeFileSync(cachePath, html, 'utf8');
	return html;
};
