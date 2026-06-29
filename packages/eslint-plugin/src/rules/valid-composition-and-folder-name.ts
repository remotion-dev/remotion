import {ESLintUtils} from '@typescript-eslint/utils';
import type {TSESTree} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'InvalidCompositionId' | 'InvalidFolderName';

const validNameRegex = /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/;

const InvalidCompositionId =
	'Composition IDs can only contain a-z, A-Z, 0-9, CJK characters and -.';

const InvalidFolderName =
	'Folder names can only contain a-z, A-Z, 0-9, CJK characters and -.';

const getStringValue = (
	value: TSESTree.JSXAttribute['value'],
): string | null => {
	if (!value) {
		return null;
	}

	if (value.type === 'Literal') {
		return typeof value.value === 'string' ? value.value : null;
	}

	if (value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const {expression} = value;

	if (expression.type === 'Literal') {
		return typeof expression.value === 'string' ? expression.value : null;
	}

	if (
		expression.type === 'TemplateLiteral' &&
		expression.expressions.length === 0
	) {
		return expression.quasis[0].value.cooked;
	}

	return null;
};

const getJsxElementName = (
	node: TSESTree.JSXTagNameExpression,
): string | null => {
	if (node.type !== 'JSXIdentifier') {
		return null;
	}

	return node.name;
};

export default createRule<Options, MessageIds>({
	name: 'valid-composition-and-folder-name',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Warns about invalid Remotion composition IDs and folder names.',
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			InvalidCompositionId,
			InvalidFolderName,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXAttribute: (node) => {
				if (node.type !== 'JSXAttribute') {
					return;
				}

				if (node.name.type !== 'JSXIdentifier') {
					return;
				}

				const parent = node.parent;
				if (!parent || parent.type !== 'JSXOpeningElement') {
					return;
				}

				const elementName = getJsxElementName(parent.name);
				if (elementName === null) {
					return;
				}

				const propName = node.name.name;
				const value = getStringValue(node.value);
				if (value === null || validNameRegex.test(value)) {
					return;
				}

				if (
					(elementName === 'Composition' || elementName === 'Still') &&
					propName === 'id'
				) {
					context.report({
						messageId: 'InvalidCompositionId',
						node,
					});
				}

				if (elementName === 'Folder' && propName === 'name') {
					context.report({
						messageId: 'InvalidFolderName',
						node,
					});
				}
			},
		};
	},
});
