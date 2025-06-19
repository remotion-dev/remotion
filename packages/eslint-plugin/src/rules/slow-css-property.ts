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
const slowCssPropertiesKebab = new Set(['box-shadow', 'text-shadow', 'filter']);

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
				let propertyName: string | undefined;

				if (node.key.type === 'Identifier') {
					propertyName = node.key.name;
				} else if (
					node.key.type === 'Literal' &&
					typeof node.key.value === 'string'
				) {
					propertyName = node.key.value;
				}

				if (!propertyName) {
					return;
				}

				const isSlowProperty =
					slowCssProperties.has(propertyName) ||
					slowCssPropertiesKebab.has(propertyName);

				if (isSlowProperty) {
					context.report({
						messageId: 'SlowCssProperty',
						node,
					});
				}
			},
		};
	},
});
