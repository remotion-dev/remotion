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

function findProblematicTailwindClass(
	classString: string,
): {match: string; index: number} | null {
	for (const pattern of nonPureAnimationTailwindClasses) {
		const match = classString.match(pattern);
		if (match) {
			return {
				match: match[0],
				index: match.index!,
			};
		}
	}
	return null;
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
					let valueNode: any;

					if (
						node.value.type === 'Literal' &&
						typeof node.value.value === 'string'
					) {
						classString = node.value.value;
						valueNode = node.value;
					} else if (
						node.value.type === 'JSXExpressionContainer' &&
						node.value.expression.type === 'Literal' &&
						typeof node.value.expression.value === 'string'
					) {
						classString = node.value.expression.value;
						valueNode = node.value.expression;
					} else if (
						node.value.type === 'JSXExpressionContainer' &&
						node.value.expression.type === 'TemplateLiteral'
					) {
						// For template literals, check all string parts
						const templateLiteral = node.value.expression;
						classString = templateLiteral.quasis
							.map((q) => q.value.cooked || q.value.raw)
							.join(' ');
						valueNode = templateLiteral;
					}

					if (classString) {
						const problematicClass = findProblematicTailwindClass(classString);
						if (problematicClass) {
							// Calculate the precise location of the problematic class
							const sourceCode = context.getSourceCode();
							const valueStart = valueNode.range[0];

							// For string literals, we need to account for quotes
							const quoteOffset = valueNode.type === 'Literal' ? 1 : 0;
							const classStart =
								valueStart + quoteOffset + problematicClass.index;
							const classEnd = classStart + problematicClass.match.length;

							const start = sourceCode.getLocFromIndex(classStart);
							const end = sourceCode.getLocFromIndex(classEnd);

							context.report({
								messageId: 'NonPureAnimation',
								loc: {
									start: {
										line: start.line,
										column: start.column + 4,
									},
									end: {
										line: end.line,
										column: end.column,
									},
								},
							});
						}
					}
				}
			},
		};
	},
});
