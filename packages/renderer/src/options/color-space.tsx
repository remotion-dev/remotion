import type {AnyRemotionOption} from './option';

export const validColorSpaces = ['default', 'bt709', 'bt2020-ncl'] as const;

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
			</code>{' '}
			(since v4.0.28),{' '}
			<code>
				{'"'}bt2020-ncl{'"'}
			</code>{' '}
			(since v4.0.88),{' '}
			<code>
				{'"'}bt2020-cl{'"'}
			</code>{' '}
			(since v4.0.88), .<br />
			If a non-default colorspace is used, it is recommended to also use{' '}
			<code>
				{'"'}png{'"'}
			</code>{' '}
			as the image format to have accurate color transformations throughout.
			Only since v4.0.83, colorspace conversion is actually performed,
			previously it would only tag the metadata of the video.
		</>
	),
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#colorspace',
	ssrName: 'colorSpace',
	type: 'default' as ColorSpace,
} satisfies AnyRemotionOption<ColorSpace>;

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
