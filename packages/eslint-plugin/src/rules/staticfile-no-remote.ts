import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://remotion.dev/docs/staticfile-remote-urls`;
});

type Options = [];

type MessageIds = 'RelativePathStaticFile';

const RelativePathStaticFile = [
	"Don't pass a remote URL to staticFile().",
	'See: https://remotion.dev/docs/staticfile-remote-urls',
].join('\n');

export default createRule<Options, MessageIds>({
	name: 'staticfile-no-remote',
	meta: {
		type: 'problem',
		docs: {
			description: RelativePathStaticFile,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			RelativePathStaticFile: RelativePathStaticFile,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			CallExpression: (node) => {
				const value = node;
				// src={"some string"}
				if (!value) {
					return;
				}

				if (
					node.type === 'CallExpression' &&
					node.callee.type === 'Identifier' &&
					node.callee.name === 'staticFile'
				) {
					const args = node.arguments;
					if (args.length === 0) {
						return;
					}

					const firstArg = args[0];

					if (firstArg.type === 'Literal') {
						const value = firstArg.value;
						if (typeof value !== 'string') {
							return;
						}
						if (value.startsWith('http://')) {
							context.report({
								messageId: 'RelativePathStaticFile',
								node,
							});
						}
						if (value.startsWith('https://')) {
							context.report({
								messageId: 'RelativePathStaticFile',
								node,
							});
						}
					}
				}
			},
		};
	},
});
