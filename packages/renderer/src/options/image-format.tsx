import type {AnyRemotionOption} from './option';

const cliFlag = 'image-format' as const;

export const imageFormatOption = {
	name: 'Image Format (deprecated)',
	cliFlag,
	ssrName: 'imageFormat' as const,
	description: () => <>Deprecated. Use --png / --jpeg / --webp instead.</>,
	docLink: 'https://www.remotion.dev/docs/cli/render#--image-format',
	type: null as never,
	getValue: () => {
		throw new Error('The "--image-format" flag is deprecated.');
	},
	setConfig: () => {},
	id: cliFlag,
} satisfies AnyRemotionOption<never>;
