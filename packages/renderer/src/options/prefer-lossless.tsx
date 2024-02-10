import type {AnyRemotionOption} from './option';

export const preferLossless = {
	name: 'Prefer lossless',
	cliFlag: 'prefer-lossless' as const,
	description: () =>
		'Uses a lossless audio codec, if one is available for the codec. If you set audioCodec, it takes priority over preferLossless.',
	docLink: 'https://www.remotion.dev/docs/encoding',
	type: false as boolean,
	ssrName: 'preferLossless' as const,
} satisfies AnyRemotionOption;
