import type {AnyRemotionOption} from './option';

const cliFlag = 'quality' as const;

export const qualityOption = {
	name: 'Quality (deprecated)',
	cliFlag,
	ssrName: 'quality' as const,
	description: () => (
		<>
			Renamed to <code>--jpeg-quality</code> in v4.0.0
		</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/still#--quality-',
	type: null as never,
	getValue: () => {
		throw new Error(
			'The "--quality" flag was deprecated in v4.0.0. Please use "--jpeg-quality" instead.',
		);
	},
	setConfig: () => {},
	id: cliFlag,
} satisfies AnyRemotionOption<never>;
