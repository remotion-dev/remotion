import type {AnyRemotionOption} from './option';

export const encodingMaxRateOption = {
	name: 'FFmpeg -maxrate flag',
	cliFlag: 'max-rate' as const,
	description: () => (
		<>
			The value for the <code>-maxrate</code> flag of FFmpeg. Should be used in
			conjunction with the encoding buffer size flag.
		</>
	),
	ssrName: 'encodingMaxRate' as const,
	docLink:
		'https://www.remotion.dev/docs/renderer/render-media#encodingmaxrate',
	type: '' as string | null,
} satisfies AnyRemotionOption;
