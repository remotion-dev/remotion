import {TwoslashError} from '@typescript/twoslash';

import {lex, parse} from 'fenceparser';
import type {Highlighter} from 'shiki';
import {getHighlighter} from 'shiki';
import type {UserConfigSettings} from 'shiki-twoslash';
import {renderCodeToHTML} from 'shiki-twoslash';
import {visit} from 'unist-util-visit';
import type {BuildVisitor} from 'unist-util-visit/lib';
import {cachedTwoslashCall} from './caching';

import {setupNodeForTwoslashException} from './exceptionMessageDOM';
import {addIncludes, replaceIncludesInCode} from './includes';
import type {Node} from './unist-types';

type OBJECT = Record<string, any>;

type Fence = {
	lang: string;
	meta: OBJECT;
};

// A set of includes which can be pulled via a set ID
const includes = new Map();

function getHTML({
	code,
	fence,
	highlighters,
	twoslash,
	twoslashSettings,
}: {
	code: string;
	fence: Fence;
	highlighters: Highlighter[];
	twoslash: any;
	twoslashSettings: UserConfigSettings;
}) {
	// Shiki doesn't respect json5 as an input, so switch it
	// to json, which can handle comments in the syntax highlight
	if (fence.lang === 'json5') {
		fence.lang = 'json';
	}

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
			// @ts-expect-error
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
export const runTwoSlashOnNode = (
	code: string,
	{lang, meta}: {lang: string; meta: Record<string, string>},
	settings = {},
) => {
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
export const highlightersFromSettings = (
	settings: UserConfigSettings,
): Promise<Highlighter[]> => {
	// console.log("i should only log once per theme")
	// ^ uncomment this to debug if required
	const themes =
		settings.themes || (settings.theme ? [settings.theme] : ['dark-plus']);

	return Promise.all(
		themes.map(async (theme) => {
			// You can put a string, a path, or the JSON theme obj
			const themeName = typeof theme === 'string' ? theme : theme.name;
			const highlighter = await getHighlighter({
				...settings,
				theme,
				themes: undefined,
			});
			// @ts-expect-error
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
 * The function doing the work of transforming any codeblock samples in a remark AST.
 */
const remarkVisitor =
	(
		highlighters: Highlighter[],
		twoslashSettings: UserConfigSettings = {},
	): BuildVisitor<Node, 'code' | 'html'> =>
	(node: Node) => {
		const code = node;
		let fence;

		try {
			fence = parseFence([node.lang, node.meta].filter(Boolean).join(' '));
		} catch {
			const twoslashError = new TwoslashError(
				'Codefence error',
				'Could not parse the codefence for this code sample',
				"It's usually an unclosed string",
				code.value,
			);
			return setupNodeForTwoslashException(code.value, node, twoslashError);
		}

		// Do nothing if the node has an attribute to ignore
		if (
			Object.keys(fence.meta).filter((key) =>
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
				node.twoslash || runTwoSlashOnNode(code.value, fence, twoslashSettings);
		} catch (error) {
			const shouldAlwaysRaise =
				process && process.env && Boolean(process.env.CI);
			// @ts-expect-error
			const yeahButNotInTests = typeof jest === 'undefined';

			if (
				(shouldAlwaysRaise && yeahButNotInTests) ||
				twoslashSettings.alwayRaiseForTwoslashExceptions
			) {
				throw error;
			} else {
				return setupNodeForTwoslashException(code.value, node, error as Error);
			}
		}

		if (twoslash) {
			node.value = twoslash.code;
			node.lang = twoslash.extension;
			node.twoslash = twoslash;
		}

		const shikiHTML = getHTML({
			code: node.value,
			fence,
			highlighters,
			twoslash,
			twoslashSettings,
		});
		// @ts-expect-error
		node.type = 'mdxJsxFlowElement';
		node.name = 'div';
		// @ts-expect-error
		node.attributes = [
			{
				type: 'mdxJsxAttribute',
				name: 'dangerouslySetInnerHTML',
				value: {
					type: 'mdxJsxAttributeValueExpression',
					value: `{\n    __html: '',\n  }`,
					data: {
						estree: {
							type: 'Program',
							start: 779,
							end: 843,
							body: [
								{
									type: 'ExpressionStatement',
									expression: {
										type: 'ObjectExpression',
										start: 779,
										end: 843,
										loc: {
											start: {line: 28, column: 27, offset: 779},
											end: {line: 30, column: 3, offset: 843},
										},
										properties: [
											{
												type: 'Property',
												start: 785,
												end: 838,
												loc: {
													start: {line: 29, column: 4, offset: 785},
													end: {line: 29, column: 57, offset: 838},
												},
												method: false,
												shorthand: false,
												computed: false,
												key: {
													type: 'Identifier',
													start: 785,
													end: 791,
													loc: {
														start: {line: 29, column: 4, offset: 785},
														end: {line: 29, column: 10, offset: 791},
													},
													name: '__html',
													range: [785, 791],
												},
												value: {
													type: 'Literal',
													start: 793,
													end: 838,
													loc: {
														start: {line: 29, column: 12, offset: 793},
														end: {line: 29, column: 57, offset: 838},
													},
													value: shikiHTML,
													raw: JSON.stringify(shikiHTML),
													range: [793, 838],
												},
												kind: 'init',
												range: [785, 838],
											},
										],
										range: [779, 843],
									},
									start: 779,
									end: 843,
									loc: {
										start: {line: 28, column: 27, offset: 779},
										end: {line: 30, column: 3, offset: 843},
									},
									range: [779, 843],
								},
							],
							sourceType: 'module',
							comments: [],
							loc: {
								start: {line: 28, column: 27, offset: 779},
								end: {line: 30, column: 3, offset: 843},
							},
							range: [779, 843],
						},
					},
				},
			},
		];
		node.children = [];
	};

/**
 * Synchronous outer function, async inner function, which is how the remark
 * async API works.
 */
export function remarkTwoslash(settings: UserConfigSettings = {}) {
	if (!highlighterCache.has(settings)) {
		highlighterCache.set(settings, highlightersFromSettings(settings));
	}

	const transform = async (markdownAST: Node) => {
		const highlighters = await highlighterCache.get(settings);
		parsingNewFile();
		visit(markdownAST, 'code', remarkVisitor(highlighters, settings));
	};

	return transform;
}

// --- The Markdown-it API ---

/** Only the inner function exposed as a synchronous API for markdown-it */

export const transformAttributesToHTML = (
	code: string,
	fenceString: string,
	highlighters: Highlighter[],
	settings: UserConfigSettings,
) => {
	const fence = parseFence(fenceString);

	const twoslash = runTwoSlashOnNode(code, fence, settings);
	const newCode = (twoslash && twoslash.code) || code;
	return getHTML({
		code: newCode,
		fence,
		highlighters,
		twoslash,
		twoslashSettings: settings,
	});
};
