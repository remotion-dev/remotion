/* eslint-disable no-console */
import type {TwoSlashReturn} from '@typescript/twoslash';
import type {UserConfigSettings} from 'shiki-twoslash';
import {runTwoSlash} from 'shiki-twoslash';
import {ModuleKind, ScriptTarget} from 'typescript';

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
		return p;
	};

	const cacheRoot = getNmCache();

	const cachePath = join(cacheRoot, `${codeSha}.json`);

	if (existsSync(cachePath)) {
		if (process.env.debug)
			console.log(`Using cached twoslash results from ${cachePath}`);

		return JSON.parse(readFileSync(cachePath, 'utf8'));
	}

	const results = runTwoSlash(code, lang, {
		...settings,
		defaultCompilerOptions: {
			...settings.defaultCompilerOptions,
			target: ScriptTarget.ESNext,
			module: ModuleKind.ESNext,
		},
	});
	if (!existsSync(cacheRoot)) mkdirSync(cacheRoot, {recursive: true});
	writeFileSync(cachePath, JSON.stringify(results), 'utf8');
	return results;
};
