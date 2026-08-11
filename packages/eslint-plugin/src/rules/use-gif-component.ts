import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'UseGifComponent';

const UseGifComponent = [
	'Use the <Gif> component animated GIFs.',
	'See: https://www.remotion.dev/docs/gif.',
	'Ignore this message if this is a non-animated GIF.',
].join('\n');

export default createRule<Options, MessageIds>({
	name: 'use-gif-component',
	meta: {
		type: 'problem',
		docs: {
			description: UseGifComponent,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			UseGifComponent: UseGifComponent,
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
				if (name.name !== 'Img' && name.name !== 'img') {
					return;
				}

				const value = node.value;
				// src={"some string"}
				if (!value) {
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
				// src="image.gif"
				if (typeof stringValue === 'string') {
					// Network and inline URLs are okay
					if (stringValue.includes('.gif')) {
						context.report({
							messageId: 'UseGifComponent',
							node,
						});
					}
				}

				if (
					value.type === 'JSXExpressionContainer' &&
					value.expression.type === 'CallExpression' &&
					value.expression.callee.type === 'Identifier' &&
					value.expression.callee.name === 'staticFile'
				) {
					const args = value.expression.arguments;
					if (args.length === 0) {
						return;
					}

					const firstArg = args[0];

					if (firstArg.type === 'Literal') {
						const value = firstArg.value;
						if (typeof value !== 'string') {
							return;
						}
						if (value.includes('.gif')) {
							context.report({
								messageId: 'UseGifComponent',
								node,
							});
						}
					}
				}
			},
		};
	},
});
