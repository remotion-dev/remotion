import type {AnyRemotionOption} from './option';

export const validColorSpaces = ['default', 'bt709'] as const;

export type ColorSpace = (typeof validColorSpaces)[number];

export const colorSpaceOption = {
	name: 'Color space',
	cliFlag: 'color-space' as const,
	description: () => (
		<>
			Color space to use for the video. Acceptable values:{' '}
			<code>
				{'"'}default{'"'}
			</code>
			,{' '}
			<code>
				{'"'}bt709{'"'}
			</code>
		</>
	),
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#colorspace',
	ssrName: 'colorSpace',
	type: 'default' as ColorSpace,
} satisfies AnyRemotionOption;

export const validateColorSpace = (option: unknown) => {
	if (validColorSpaces.includes(option as ColorSpace)) {
		return;
	}

	throw new Error(
		`Expected one of ${validColorSpaces.map((c) => `"${c}"`).join(', ')} for ${
			colorSpaceOption.ssrName
		} but got "${option}"`,
	);
};
