import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://remotion.dev/docs/staticfile-relative-paths`;
});

type Options = [];

type MessageIds =
	| 'RelativePathStaticFile'
	| 'AbsoluteStaticFile'
	| 'PublicStaticFile';

const RelativePathStaticFile = [
	"Don't pass a relative path to staticFile().",
	'See: https://remotion.dev/docs/staticfile-relative-paths',
].join('\n');

const AbsoluteStaticFile = [
	'Do not pass an absolute path to staticFile().',
	'See: https://remotion.dev/docs/staticfile-relative-paths',
].join('');

const PublicStaticFile = [
	'Do not prefix your assets with public/.',
	'See: https://remotion.dev/docs/staticfile-relative-paths',
].join('');

export default createRule<Options, MessageIds>({
	name: 'staticfile-no-relative',
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
			PublicStaticFile: PublicStaticFile,
			AbsoluteStaticFile: AbsoluteStaticFile,
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
						if (value.startsWith('./')) {
							context.report({
								messageId: 'RelativePathStaticFile',
								node,
							});
						}
						if (value.startsWith('../')) {
							context.report({
								messageId: 'RelativePathStaticFile',
								node,
							});
						}

						if (value.startsWith('public/')) {
							context.report({
								messageId: 'PublicStaticFile',
								node,
							});
						}

						if (
							value.startsWith('/Users') ||
							value.startsWith('/home') ||
							value.startsWith('/tmp') ||
							value.startsWith('/etc') ||
							value.startsWith('/opt') ||
							value.startsWith('/var') ||
							value.startsWith('C:') ||
							value.startsWith('D:') ||
							value.startsWith('E:')
						) {
							context.report({
								messageId: 'AbsoluteStaticFile',
								node,
							});
						}
					}
				}
			},
		};
	},
});
