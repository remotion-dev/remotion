import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return 'https://remotion.dev/docs/media/video#objectfit';
});

type Options = [];
type MessageIds = 'NoObjectFitInStyle' | 'NoObjectFitInClassName';

const NoObjectFitInStyle = [
	'Passing `objectFit` via the `style` prop is not supported for `<Video>` from `@remotion/media`.',
	'Use the `objectFit` prop directly instead.',
	'See: https://remotion.dev/docs/media/video#objectfit',
].join('\n');

const NoObjectFitInClassName = [
	'Passing an `object-fit` CSS class via `className` is not supported for `<Video>` from `@remotion/media`.',
	'Use the `objectFit` prop directly instead.',
	'See: https://remotion.dev/docs/media/video#objectfit',
].join('\n');

const objectFitClassPattern =
	/\bobject-(contain|cover|fill|none|scale-down)\b/;

export default createRule<Options, MessageIds>({
	name: 'no-object-fit-on-media-video',
	meta: {
		type: 'problem',
		docs: {
			description: NoObjectFitInStyle,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			NoObjectFitInStyle,
			NoObjectFitInClassName,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXOpeningElement: (node) => {
				if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'Video') {
					return;
				}

				for (const attr of node.attributes) {
					if (attr.type !== 'JSXAttribute') {
						continue;
					}

					// Check style={{ objectFit: ... }}
					if (
						attr.name.type === 'JSXIdentifier' &&
						attr.name.name === 'style' &&
						attr.value
					) {
						if (
							attr.value.type === 'JSXExpressionContainer' &&
							attr.value.expression.type === 'ObjectExpression'
						) {
							for (const prop of attr.value.expression.properties) {
								if (prop.type !== 'Property') {
									continue;
								}

								let propertyName: string | undefined;
								if (prop.key.type === 'Identifier') {
									propertyName = prop.key.name;
								} else if (
									prop.key.type === 'Literal' &&
									typeof prop.key.value === 'string'
								) {
									propertyName = prop.key.value;
								}

								if (
									propertyName === 'objectFit' ||
									propertyName === 'object-fit'
								) {
									context.report({
										messageId: 'NoObjectFitInStyle',
										node: prop,
									});
								}
							}
						}
					}

					// Check className for Tailwind object-fit classes
					if (
						attr.name.type === 'JSXIdentifier' &&
						attr.name.name === 'className' &&
						attr.value
					) {
						let classString: string | undefined;

						if (
							attr.value.type === 'Literal' &&
							typeof attr.value.value === 'string'
						) {
							classString = attr.value.value;
						} else if (
							attr.value.type === 'JSXExpressionContainer' &&
							attr.value.expression.type === 'Literal' &&
							typeof attr.value.expression.value === 'string'
						) {
							classString = attr.value.expression.value;
						} else if (
							attr.value.type === 'JSXExpressionContainer' &&
							attr.value.expression.type === 'TemplateLiteral'
						) {
							classString = attr.value.expression.quasis
								.map((q) => q.value.cooked || q.value.raw)
								.join(' ');
						}

						if (classString && objectFitClassPattern.test(classString)) {
							context.report({
								messageId: 'NoObjectFitInClassName',
								node: attr,
							});
						}
					}
				}
			},
		};
	},
});
