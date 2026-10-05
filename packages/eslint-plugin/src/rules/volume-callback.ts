import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = 'VolumeCallback';

const VolumeCallback =
	'Deprecated no-op kept for compatibility. Volume can be animated with regular keyframes.';

export default createRule<Options, MessageIds>({
	name: 'volume-callback',
	meta: {
		type: 'problem',
		docs: {
			description: VolumeCallback,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			VolumeCallback,
		},
	},
	defaultOptions: [],
	create: () => ({}),
});
