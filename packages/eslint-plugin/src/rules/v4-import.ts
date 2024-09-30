import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://www.remotion.dev/docs/4-0-migration`;
});

type Options = [];

type MessageIds = 'ImportConfig';

const ImportConfig =
	"Update the import to the new V4 location: import {Config} from '@remotion/cli/config'";

const rule = createRule<Options, MessageIds>({
	name: 'v4-config-import',
	meta: {
		type: 'problem',
		docs: {
			description: ImportConfig,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			ImportConfig,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			ImportDeclaration: (node) => {
				if (node.source.value !== 'remotion') {
					return;
				}
				const config = node.specifiers.find(
					(s) => s.type === 'ImportSpecifier' && s.imported.name === 'Config',
				);
				if (config) {
					context.report({
						messageId: 'ImportConfig',
						node,
					});
				}
			},
		};
	},
});

export default rule;
