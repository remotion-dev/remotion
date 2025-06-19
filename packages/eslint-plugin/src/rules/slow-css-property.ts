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

// Tailwind classes that correspond to slow CSS properties
const slowTailwindClasses = [
	// Shadow classes (box-shadow)
	/\bshadow-(?:sm|md|lg|xl|2xl|inner|none|\w+)\b/,
	/\bshadow-\w+(?:\/\d+)?\b/, // Custom shadow colors
	// Filter classes
	/\bblur-(?:none|sm|md|lg|xl|2xl|3xl|\w+)\b/,
	/\bbrightness-\d+\b/,
	/\bcontrast-\d+\b/,
	/\bdrop-shadow-(?:sm|md|lg|xl|2xl|none|\w+)\b/,
	/\bgrayscale(?:-\d+)?\b/,
	/\bhue-rotate-\d+\b/,
	/\binvert(?:-\d+)?\b/,
	/\bsaturate-\d+\b/,
	/\bsepia(?:-\d+)?\b/,
	// Text shadow (custom utilities)
	/\btext-shadow-\w+\b/,
];

function containsSlowTailwindClass(classString: string): boolean {
	return slowTailwindClasses.some((pattern) => pattern.test(classString));
}

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
			JSXAttribute: (node) => {
				if (
					node.name.type === 'JSXIdentifier' &&
					node.name.name === 'className' &&
					node.value
				) {
					let classString: string | undefined;

					if (
						node.value.type === 'Literal' &&
						typeof node.value.value === 'string'
					) {
						classString = node.value.value;
					} else if (
						node.value.type === 'JSXExpressionContainer' &&
						node.value.expression.type === 'Literal' &&
						typeof node.value.expression.value === 'string'
					) {
						classString = node.value.expression.value;
					} else if (
						node.value.type === 'JSXExpressionContainer' &&
						node.value.expression.type === 'TemplateLiteral'
					) {
						// For template literals, check all string parts
						const templateLiteral = node.value.expression;
						classString = templateLiteral.quasis
							.map((q) => q.value.cooked || q.value.raw)
							.join(' ');
					}

					if (classString && containsSlowTailwindClass(classString)) {
						context.report({
							messageId: 'SlowCssProperty',
							node,
						});
					}
				}
			},
		};
	},
});
