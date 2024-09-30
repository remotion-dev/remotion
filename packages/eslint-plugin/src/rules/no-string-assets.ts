import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'NoStringAssets';

const NoStringAssets = [
	"Don't reference local assets by string, use an import statement or staticFile() instead.",
	'See: https://www.remotion.dev/docs/assets',
].join('\n');

export default createRule<Options, MessageIds>({
	name: 'no-string-assets',
	meta: {
		type: 'problem',
		docs: {
			description: NoStringAssets,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			NoStringAssets: NoStringAssets,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXAttribute: (node) => {
				if (node.type !== 'JSXAttribute') {
					return;
				}
				if (node.name.name !== 'src') {
					return;
				}
				const value = node.value;
				// src={"some string"}
				const insideCurlyBraces =
					value &&
					value.type === 'JSXExpressionContainer' &&
					value.expression.type === 'Literal';
				if (!value || (value.type !== 'Literal' && !insideCurlyBraces)) {
					return;
				}
				const stringValue =
					value &&
					value.type === 'JSXExpressionContainer' &&
					value.expression.type === 'Literal'
						? value.expression.value
						: value.type === 'Literal'
							? value.value
							: null;
				if (typeof stringValue !== 'string') {
					return;
				}

				const parent = node.parent;
				if (!parent) {
					return;
				}
				if (parent.type !== 'JSXOpeningElement') {
					return;
				}
				const name = parent.name;
				if (name.type !== 'JSXIdentifier') {
					return;
				}
				if (
					name.name === 'Img' ||
					name.name === 'img' ||
					name.name === 'Audio' ||
					name.name === 'audio' ||
					name.name === 'Video' ||
					name.name === 'video' ||
					name.name === 'source'
				) {
					// Network and inline URLs are okay
					if (stringValue.startsWith('http://')) {
						return;
					}
					if (stringValue.startsWith('https://')) {
						return;
					}
					if (stringValue.startsWith('data:')) {
						return;
					}
					context.report({
						messageId: 'NoStringAssets',
						node,
					});
				}
			},
		};
	},
});
