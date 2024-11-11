import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'EvenDimensions';

const EvenDimensions =
	"Videos rendered in H264/H265 codec do not support dimensions that are not divisible by 2. Make the number even to resolve this warning. Ignore this warning if you don't plan on rendering this video with a H264 or H265 codec.";

export default createRule<Options, MessageIds>({
	name: 'even-dimensions',
	meta: {
		type: 'problem',
		docs: {
			description: EvenDimensions,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			EvenDimensions,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXAttribute: (node) => {
				if (node.type !== 'JSXAttribute') {
					return;
				}
				if (node.name.name !== 'width' && node.name.name !== 'height') {
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
				if (typeof stringValue !== 'number') {
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
				if (name.name !== 'Composition') {
					return;
				}
				if (stringValue % 2 !== 0) {
					context.report({
						messageId: 'EvenDimensions',
						node,
					});
				}
			},
		};
	},
});
