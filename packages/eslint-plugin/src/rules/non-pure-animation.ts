import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return 'https://www.remotion.dev/docs/flickering';
});

type Options = [];
type MessageIds = 'NonPureAnimation';

const NonPureAnimation = [
	'This animation does not run purely off useCurrentFrame() and will lead to flickering.',
	'See: https://www.remotion.dev/docs/flickering',
].join('\n');

const nonPureAnimationProperties = new Set(['transition']);
const nonPureAnimationPropertiesKebab = new Set(['transition']);

// Tailwind classes that correspond to non-pure animations
const nonPureAnimationTailwindClasses = [
	// Basic transition classes
	/\btransition\b/,
	/\btransition-(?:all|none|colors|opacity|shadow|transform)\b/,
	// Additional common transition properties
	/\btransition-(?:spacing|size|width|height|margin|padding)\b/,
	// Custom transition properties (catch-all for any transition-*)
	/\btransition-\w+\b/,
];

function containsNonPureAnimationTailwindClass(classString: string): boolean {
	return nonPureAnimationTailwindClasses.some((pattern) =>
		pattern.test(classString),
	);
}

export default createRule<Options, MessageIds>({
	name: 'non-pure-animation',
	meta: {
		type: 'problem',
		docs: {
			description: NonPureAnimation,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			NonPureAnimation: NonPureAnimation,
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

				const isNonPureProperty =
					nonPureAnimationProperties.has(propertyName) ||
					nonPureAnimationPropertiesKebab.has(propertyName);

				if (isNonPureProperty) {
					context.report({
						messageId: 'NonPureAnimation',
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

					if (
						classString &&
						containsNonPureAnimationTailwindClass(classString)
					) {
						context.report({
							messageId: 'NonPureAnimation',
							node,
						});
					}
				}
			},
		};
	},
});
