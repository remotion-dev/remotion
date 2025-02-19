import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'From0';

const From0 = '0 is now the default, so you can remove the prop.';

export default createRule<Options, MessageIds>({
	name: 'from',
	meta: {
		type: 'problem',
		docs: {
			description: From0,
			recommended: 'warn',
		},
		fixable: 'code',
		schema: [],
		messages: {
			From0,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXAttribute: (node) => {
				if (node.type !== 'JSXAttribute') {
					return;
				}

				if (node.name.name !== 'from') {
					return;
				}
				const value = node.value;
				if (!value || value.type !== 'JSXExpressionContainer') {
					return;
				}

				const expression = value.expression;
				if (!expression || expression.type !== 'Literal') {
					return;
				}

				const stringValue = expression.value;

				if (stringValue !== 0) {
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
				if (stringValue === 0) {
					context.report({
						messageId: 'From0',
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
