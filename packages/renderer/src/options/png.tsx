import type {AnyRemotionOption} from './option';

const cliFlag = 'png' as const;

export const pngOption = {
	name: 'PNG (deprecated)',
	cliFlag,
	ssrName: 'png' as const,
	description: () => <>Deprecated. Throws an error if used.</>,
	docLink: null,
	type: null as never,
	getValue: () => {
			throw new Error(
			'The "--png" flag is deprecated.'
		);
	},
	setConfig: () => {},
	id: cliFlag,
} satisfies AnyRemotionOption<never>;
