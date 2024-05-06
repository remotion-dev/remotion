import {NoReactInternals} from 'remotion/no-react';
import type {AnyRemotionOption} from './option';

const validV4ColorSpaces = ['default', 'bt709', 'bt2020-ncl'] as const;
const validV5ColorSpaces = ['bt601', 'bt709', 'bt2020-ncl'] as const;

export const validColorSpaces = (
	NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? validV5ColorSpaces
		: validV4ColorSpaces
) as true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? typeof validV5ColorSpaces
	: typeof validV4ColorSpaces;

export type ColorSpace = (typeof validColorSpaces)[number];

export const DEFAULT_COLOR_SPACE = (
	NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? 'bt709' : 'default'
) as true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? 'bt709'
	: 'default';

let colorSpace: ColorSpace = DEFAULT_COLOR_SPACE;

const cliFlag = 'color-space' as const;

export const colorSpaceOption = {
	name: 'Color space',
	cliFlag: 'color-space' as const,
	description: () => (
		<>
			Color space to use for the video. Acceptable values:{' '}
			<code>
				{'"'}
				{DEFAULT_COLOR_SPACE}
				{'"'}
			</code>
			(default since 5.0),{' '}
			{NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? (
				<code>
					{'"'}bt601{'"'}
					{', '}
				</code>
			) : (
				<>
					<code>
						{'"'}bt709{'"'}
					</code>{' '}
					(since v4.0.28),{' '}
				</>
			)}
			<code>
				{'"'}bt2020-ncl{'"'}
			</code>{' '}
			(since v4.0.88),{' '}
			<code>
				{'"'}bt2020-cl{'"'}
			</code>{' '}
			(since v4.0.88), .<br />
			For best color accuracy, it is recommended to also use{' '}
			<code>
				{'"'}png{'"'}
			</code>{' '}
			as the image format to have accurate color transformations throughout.
			<br />
			Only since v4.0.83, colorspace conversion is actually performed,
			previously it would only tag the metadata of the video.
		</>
	),
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#colorspace',
	ssrName: 'colorSpace',
	type: DEFAULT_COLOR_SPACE as ColorSpace | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as ColorSpace,
			};
		}

		if (colorSpace !== DEFAULT_COLOR_SPACE) {
			return {
				source: 'config',
				value: colorSpace,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_COLOR_SPACE,
		};
	},
	setConfig: (value) => {
		colorSpace = value ?? DEFAULT_COLOR_SPACE;
	},
} satisfies AnyRemotionOption<ColorSpace | null>;

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
