import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'VolumeCallback';

const VolumeCallback =
	'Prefer a callback function for setting the volume: `volume={(f) => interpolate(...)}`. See https://www.remotion.dev/docs/using-audio/#controlling-volume';

export default createRule<Options, MessageIds>({
	name: 'volume-callback',
	meta: {
		type: 'problem',
		docs: {
			description: VolumeCallback,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			VolumeCallback,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXAttribute: (node) => {
				if (node.type !== 'JSXAttribute') {
					return;
				}
				if (node.name.name !== 'volume') {
					return;
				}
				const value = node.value;
				if (!value || value.type !== 'JSXExpressionContainer') {
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
				if (name.name !== 'Video' && name.name !== 'Audio') {
					return;
				}

				const expression = value.expression;
				if (!expression) {
					return;
				}

				if (expression.type === 'Literal') {
					return;
				}
				if (expression.type === 'ArrowFunctionExpression') {
					return;
				}

				context.report({
					messageId: 'VolumeCallback',
					node,
				});
			},
		};
	},
});
