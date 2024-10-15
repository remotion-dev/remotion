import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'DurationInFrames';

const DurationInFrames =
	'Infinity is now the default, so you can remove the prop.';

export default createRule<Options, MessageIds>({
	name: 'duration-in-frames',
	meta: {
		type: 'problem',
		docs: {
			description: DurationInFrames,
			recommended: 'warn',
		},
		fixable: 'code',
		schema: [],
		messages: {
			DurationInFrames,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXAttribute: (node) => {
				if (node.type !== 'JSXAttribute') {
					return;
				}

				if (node.name.name !== 'durationInFrames') {
					return;
				}
				const value = node.value;
				if (!value || value.type !== 'JSXExpressionContainer') {
					return;
				}

				const expression = value.expression;
				if (!expression || expression.type !== 'Identifier') {
					return;
				}

				const stringValue = expression.name;
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
				if (name.name !== 'Sequence') {
					return;
				}
				if (stringValue === 'Infinity') {
					context.report({
						messageId: 'DurationInFrames',
						node,
						fix: (fixer) => {
							return fixer.removeRange([node.name.range[0], value.range[1]]);
						},
					});
				}
			},
		};
	},
});
