import {TwoslashError} from '@typescript/twoslash';

import {lex, parse} from 'fenceparser';
import {Highlighter, getHighlighter} from 'shiki';
import {UserConfigSettings, renderCodeToHTML} from 'shiki-twoslash';
import {Visitor, visit} from 'unist-util-visit';

const {setupNodeForTwoslashException} = require('./exceptionMessageDOM');
const {addIncludes, replaceIncludesInCode} = require('./includes');

type OBJECT = Record<string, any>;

type Fence = {
	lang: string;
	meta: OBJECT;
};

// A set of includes which can be pulled via a set ID
const includes = new Map();

function getHTML(
	code: string,
	fence: Fence,
	highlighters: any[],
	twoslash: any,
	twoslashSettings: UserConfigSettings,
) {
	// Shiki doesn't respect json5 as an input, so switch it
	// to json, which can handle comments in the syntax highlight
	const replacer = {
		json5: 'json',
	};

	if (replacer[fence.lang]) fence.lang = replacer[fence.lang];

	let results;
	// Support 'twoslash' includes
	if (fence.lang === 'twoslash') {
		if (!fence.meta.include || typeof fence.meta.include !== 'string') {
			throw new Error(
				"A twoslash code block needs a pragma like 'twoslash include [name]'",
			);
		}

		addIncludes(includes, fence.meta.include, code);
		results = twoslashSettings.wrapFragments
			? `<div class="shiki-twoslash-fragment"></div>`
			: '';
	} else {
		// All good, get each highlighter and render the shiki output for it
		const output = highlighters.map((highlighter) => {
			const themeName = highlighter.customName
				.split('/')
				.pop()
				.replace('.json', '');
			return renderCodeToHTML(
				code,
				fence.lang,
				fence.meta,
				{themeName, ...twoslashSettings},
				highlighter,
				twoslash,
			);
		});
		results = output.join('\n');
		if (highlighters.length > 1 && twoslashSettings.wrapFragments) {
			results = `<div class="shiki-twoslash-fragment">${results}</div>`;
		}
	}

	return results;
}

/**
 * Runs twoslash across an AST node, switching out the text content, and lang
 * and adding a `twoslash` property to the node.
 */
export const runTwoSlashOnNode = (code, {lang, meta}, settings = {}) => {
	// Offer a way to do high-perf iterations, this is less useful
	// given that we cache the results of twoslash in the file-system
	const shouldDisableTwoslash =
		typeof process !== 'undefined' &&
		process.env &&
		Boolean(process.env.TWOSLASH_DISABLE);
	if (shouldDisableTwoslash) return undefined;

	// Only run twoslash when the meta has the attribute twoslash
	if (meta.twoslash) {
		const importedCode = replaceIncludesInCode(includes, code);
		return cachedTwoslashCall(importedCode, lang, settings);
	}

	return undefined;
};

// To make sure we only have one highlighter per theme in a process
const highlighterCache = new Map();

/** Sets up the highlighters, and cache's for recalls */
export const highlightersFromSettings = (settings): Promise<Highlighter[]> => {
	// console.log("i should only log once per theme")
	// ^ uncomment this to debug if required
	const themes =
		settings.themes || (settings.theme ? [settings.theme] : ['light-plus']);

	return Promise.all(
		themes.map(async (theme) => {
			// You can put a string, a path, or the JSON theme obj
			const themeName = theme.name || theme;
			const highlighter = await getHighlighter({
				...settings,
				theme,
				themes: undefined,
			});

			highlighter.customName = themeName;
			return highlighter;
		}),
	);
};

const parsingNewFile = () => includes.clear();

const parseFence = (fence: string): Fence => {
	const [lang, ...tokens] = lex(fence);

	// if the language is twoslash and include key is found
	// insert an `=` after include to make it `include=[name]`
	// which yields better meta
	if (lang === 'twoslash') {
		// Search for `include` in tokens
		const index = tokens.indexOf('include');
		if (index !== -1) {
			tokens.splice(index + 1, 0, '=');
		}
	}

	const meta = parse(tokens) ?? {};

	return {
		lang: (lang || '').toString(),
		meta,
	};
};

// --- The Remark API ---

/**
 * Synchronous outer function, async inner function, which is how the remark
 * async API works.
 */
export function remarkTwoslash(settings = {}) {
	if (!highlighterCache.has(settings)) {
		highlighterCache.set(settings, highlightersFromSettings(settings));
	}

	const transform = async (markdownAST) => {
		const highlighters = await highlighterCache.get(settings);
		parsingNewFile();
		visit(markdownAST, 'code', remarkVisitor(highlighters, settings));
	};

	return transform;
}

/**
 * The function doing the work of transforming any codeblock samples in a remark AST.
 */
const remarkVisitor =
	(highlighters, twoslashSettings = {}): Visitor =>
	(node) => {
		const code = node;
		let fence;

		try {
			fence = parseFence([node.lang, node.meta].filter(Boolean).join(' '));
		} catch (error) {
			const twoslashError = new TwoslashError(
				'Codefence error',
				'Could not parse the codefence for this code sample',
				"It's usually an unclosed string",
				code,
			);
			return setupNodeForTwoslashException(code, node, twoslashError);
		}

		// Do nothing if the node has an attribute to ignore
		if (
			Object.keys(fence.meta).filter((key) =>
				// @ts-expect-error
				(twoslashSettings.ignoreCodeblocksWithCodefenceMeta || []).includes(
					key,
				),
			).length > 0
		) {
			return;
		}

		let twoslash;
		try {
			// By allowing node.twoslash to already exist you can set it up yourself in a browser
			twoslash =
				node.twoslash || runTwoSlashOnNode(code, fence, twoslashSettings);
		} catch (error) {
			const shouldAlwaysRaise =
				process && process.env && Boolean(process.env.CI);
			// @ts-expect-error
			const yeahButNotInTests = typeof jest === 'undefined';

			if (
				(shouldAlwaysRaise && yeahButNotInTests) ||
				// @ts-expect-error
				twoslashSettings.alwayRaiseForTwoslashExceptions
			) {
				throw error;
			} else {
				return setupNodeForTwoslashException(code, node, error);
			}
		}

		if (twoslash) {
			node.value = twoslash.code;
			node.lang = twoslash.extension;
			node.twoslash = twoslash;
		}

		const shikiHTML = getHTML(
			node.value,
			fence,
			highlighters,
			twoslash,
			twoslashSettings,
		);
		node.type = 'html';
		node.value = shikiHTML;
		node.children = [];
	};

// --- The Markdown-it API ---

/** Only the inner function exposed as a synchronous API for markdown-it */

export const transformAttributesToHTML = (
	code: string,
	fenceString: string,
	highlighters,
	settings: UserConfigSettings,
) => {
	const fence = parseFence(fenceString);

	const twoslash = runTwoSlashOnNode(code, fence, settings);
	const newCode = (twoslash && twoslash.code) || code;
	return getHTML(newCode, fence, highlighters, twoslash, settings);
};
