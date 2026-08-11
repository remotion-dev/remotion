import type {CodecOrUndefined} from '../codec';
import type {VideoImageFormat} from '../image-format';
import {validVideoImageFormats} from '../image-format';
import {isAudioCodec} from '../is-audio-codec';
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
	getValue: (
		{commandLine},
		options?: {
			codec: CodecOrUndefined;
			uiVideoImageFormat: VideoImageFormat | null;
			compositionDefaultVideoImageFormat: VideoImageFormat | null;
		},
	) => {
		if (options?.uiVideoImageFormat) {
			return {
				source: 'via UI',
				value: options.uiVideoImageFormat,
			};
		}

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
				source: 'from --image-format flag',
				value,
			};
		}

		if (options && options.compositionDefaultVideoImageFormat !== null) {
			return {
				source: 'via calculateMetadata',
				value: options.compositionDefaultVideoImageFormat,
			};
		}

		if (currentVideoImageFormat !== null) {
			return {
				source: 'Config file',
				value: currentVideoImageFormat,
			};
		}

		if (options) {
			if (isAudioCodec(options.codec)) {
				return {
					source: 'default',
					value: 'none',
				};
			}

			if (
				options.codec === 'h264' ||
				options.codec === 'h264-mkv' ||
				options.codec === 'h264-ts' ||
				options.codec === 'h265' ||
				options.codec === 'av1' ||
				options.codec === 'vp8' ||
				options.codec === 'vp9' ||
				options.codec === 'prores' ||
				options.codec === 'gif'
			) {
				return {
					source: 'default',
					value: 'jpeg',
				};
			}

			if (options.codec === undefined) {
				return {
					source: 'default',
					value: 'png',
				};
			}

			throw new Error('Unrecognized codec ' + options.codec);
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
