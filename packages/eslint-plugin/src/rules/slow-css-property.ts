import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return 'https://remotion.dev/docs/gpu';
});

type Options = [];
type MessageIds = 'SlowCssProperty';

const SlowCssProperty = [
	"This GPU effect may slow down the render on machines which don't have a GPU.",
	'See: https://remotion.dev/docs/gpu',
].join('\n');

const slowCssProperties = new Set(['boxShadow', 'textShadow', 'filter']);

export default createRule<Options, MessageIds>({
	name: 'slow-css-property',
	meta: {
		type: 'problem',
		docs: {
			description: SlowCssProperty,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			SlowCssProperty: SlowCssProperty,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			Property: (node) => {
				if (node.key.type !== 'Identifier') {
					return;
				}

				if (slowCssProperties.has(node.key.name)) {
					context.report({
						messageId: 'SlowCssProperty',
						node,
					});
				}
			},
		};
	},
});
