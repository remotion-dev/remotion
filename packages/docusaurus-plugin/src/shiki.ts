import {lex, parse} from 'fenceparser';
import type {BundledLanguage, BundledTheme, HighlighterGeneric} from 'shiki';
import {createHighlighter} from 'shiki';
import type {BuildVisitor} from 'unist-util-visit';
import {visit} from 'unist-util-visit';
import {cachedTwoslashCall} from './caching';

import {setupNodeForTwoslashException} from './exceptionMessageDOM';
import {addIncludes, replaceIncludesInCode} from './includes';
import type {Node} from './unist-types';

type OBJECT = Record<string, unknown>;

type Fence = {
	lang: string;
	meta: OBJECT;
};

interface TwoslashSettings {
	themes?: string[];
	theme?: string;
	wrapFragments?: boolean;
	ignoreCodeblocksWithCodefenceMeta?: string[];
	alwayRaiseForTwoslashExceptions?: boolean;
	defaultCompilerOptions?: Record<string, unknown>;
	[key: string]: unknown;
}

// A set of includes which can be pulled via a set ID
const includes = new Map<string, string>();

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

// To make sure we only have one highlighter per settings in a process
const highlighterCache = new Map<
	TwoslashSettings,
	Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>
>();

const ALL_LANGS: BundledLanguage[] = [
	'tsx',
	'typescript',
	'jsx',
	'javascript',
	'json',
	'bash',
	'shellscript',
	'css',
	'html',
	'diff',
	'yaml',
	'toml',
	'docker',
	'python',
	'ruby',
	'go',
	'php',
	'markdown',
	'ini',
];

/** Creates a highlighter and caches for reuse */
const getHighlighterInstance = (
	settings: TwoslashSettings,
): Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> => {
	if (!highlighterCache.has(settings)) {
		highlighterCache.set(
			settings,
			createHighlighter({
				themes: ['github-dark'],
				langs: ALL_LANGS,
			}),
		);
	}

	return highlighterCache.get(settings)!;
};

// --- The Remark API ---

/**
 * The function doing the work of transforming any codeblock samples in a remark AST.
 */
const remarkVisitor =
	(
		highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>,
		twoslashSettings: TwoslashSettings = {},
	): BuildVisitor<Node, 'code' | 'html'> =>
	(node: Node) => {
		const code = node;
		let fence: Fence;

		try {
			fence = parseFence([node.lang, node.meta].filter(Boolean).join(' '));
		} catch {
			return setupNodeForTwoslashException(
				code.value,
				node,
				new Error('Could not parse the codefence for this code sample'),
			);
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

		let shikiHTML: string;

		if (fence.lang === 'twoslash') {
			// Support 'twoslash' includes
			if (!fence.meta.include || typeof fence.meta.include !== 'string') {
				throw new Error(
					"A twoslash code block needs a pragma like 'twoslash include [name]'",
				);
			}

			addIncludes(includes, fence.meta.include, node.value);
			shikiHTML = twoslashSettings.wrapFragments
				? `<div class="shiki-twoslash-fragment"></div>`
				: '';
		} else if (fence.meta.twoslash) {
			// Twoslash code block — use cached call
			const importedCode = replaceIncludesInCode(includes, node.value);
			try {
				shikiHTML = cachedTwoslashCall(importedCode, fence.lang, highlighter);
			} catch (error) {
				const shouldAlwaysRaise =
					process && process.env && Boolean(process.env.CI);

				if (
					shouldAlwaysRaise ||
					twoslashSettings.alwayRaiseForTwoslashExceptions
				) {
					throw error;
				} else {
					return setupNodeForTwoslashException(
						code.value,
						node,
						error as Error,
					);
				}
			}

			// Add copy button
			shikiHTML = shikiHTML.replace(
				'</pre>',
				'<button class="copy-button" aria-label="Copy code to clipboard">Copy</button></pre>',
			);
		} else {
			// Regular (non-twoslash) code block
			const langAliases: Record<string, string> = {
				json5: 'json',
				js: 'javascript',
				ts: 'typescript',
				sh: 'bash',
				rb: 'ruby',
				md: 'markdown',
				txt: 'plaintext',
			};
			const resolvedLang = langAliases[fence.lang] || fence.lang || 'plaintext';

			try {
				shikiHTML = highlighter.codeToHtml(node.value, {
					lang: resolvedLang,
					theme: 'github-dark',
				});
			} catch {
				// Fallback: if language is not supported, render as plaintext
				shikiHTML = highlighter.codeToHtml(node.value, {
					lang: 'plaintext',
					theme: 'github-dark',
				});
			}

			// Add copy button
			shikiHTML = shikiHTML.replace(
				'</pre>',
				'<button class="copy-button" aria-label="Copy code to clipboard">Copy</button></pre>',
			);
		}

		// Inject title bar if fence has a title attribute
		if (fence.meta.title && typeof fence.meta.title === 'string') {
			const {title} = fence.meta;
			shikiHTML = shikiHTML.replace(
				'<pre class="shiki',
				'<pre class="shiki with-title',
			);
			shikiHTML = shikiHTML.replace(
				/(<pre[^>]*>)/,
				`$1<div class="code-title">${title}</div>`,
			);
		}

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
export function remarkTwoslash(settings: TwoslashSettings = {}) {
	const transform = async (markdownAST: Node) => {
		const highlighter = await getHighlighterInstance(settings);
		parsingNewFile();
		visit(markdownAST, 'code', remarkVisitor(highlighter, settings));
	};

	return transform;
}
