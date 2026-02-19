import type {VideoImageFormat} from '../image-format';
import {validVideoImageFormats} from '../image-format';
import type {AnyRemotionOption} from './option';

let currentVideoImageFormat: VideoImageFormat | null = null;

const cliFlag = 'image-format' as const;

export const videoImageFormatOption = {
	name: 'Video Image Format',
	cliFlag,
	description: () => (
		<>
			The image format to use when rendering frames for a video. Must be one of{' '}
			{validVideoImageFormats.map((f) => `"${f}"`).join(', ')}. Default:{' '}
			<code>&quot;jpeg&quot;</code>. JPEG is faster, but does not support
			transparency.
		</>
	),
	ssrName: 'imageFormat' as const,
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#imageformat',
	type: null as VideoImageFormat | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as VideoImageFormat;
			if (
				!(validVideoImageFormats as readonly string[]).includes(value as string)
			) {
				throw new Error(
					`Invalid video image format: ${value}. Must be one of: ${validVideoImageFormats.join(', ')}`,
				);
			}

			return {
				source: 'cli',
				value,
			};
		}

		if (currentVideoImageFormat !== null) {
			return {
				source: 'config',
				value: currentVideoImageFormat,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value) => {
		if (value === null) {
			currentVideoImageFormat = null;
			return;
		}

		if (
			!(validVideoImageFormats as readonly string[]).includes(value as string)
		) {
			throw new TypeError(
				[
					`Value ${value} is not valid as a video image format.`,
					// @ts-expect-error
					value === 'jpg' ? 'Did you mean "jpeg"?' : null,
				]
					.filter(Boolean)
					.join(' '),
			);
		}

		currentVideoImageFormat = value;
	},
	id: 'video-image-format',
} satisfies AnyRemotionOption<VideoImageFormat | null>;
